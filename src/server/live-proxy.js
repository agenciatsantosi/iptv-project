import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;
const TEMP_DIR = path.join(process.cwd(), 'temp-streams');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Store active ffmpeg processes
const activeStreams = new Map();

app.use(cors());

// Servir arquivos estáticos do diretório temp com os tipos MIME corretos
app.use('/temp-streams', (req, res, next) => {
  // Adicionar headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.path.endsWith('.m3u8')) {
    res.set({
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
  } else if (req.path.endsWith('.ts')) {
    res.set({
      'Content-Type': 'video/mp2t',
      'Cache-Control': 'no-cache'
    });
  }
  next();
}, express.static(TEMP_DIR));

app.get('/stream', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    // Garantir que o diretório temp existe
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Criar um ID único para o stream
    const streamId = crypto.randomBytes(16).toString('hex');
    const outputPath = path.join(TEMP_DIR, streamId);
    fs.mkdirSync(outputPath);

    console.log('Diretório de saída criado:', outputPath);

    const playlistPath = path.join(outputPath, 'playlist.m3u8');
    console.log('Caminho da playlist:', playlistPath);

    // Verificar se já existe um processo ffmpeg para este stream
    if (!activeStreams.has(streamId)) {
      console.log('Iniciando novo processo FFmpeg');
      
      // Configurar FFmpeg para converter para HLS
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\nReferer: http://motoplatxrd.com/\r\n',
        '-reconnect', '1',
        '-reconnect_streamed', '1', 
        '-reconnect_delay_max', '5',
        '-i', url,
        '-c:v', 'copy',  
        '-c:a', 'copy',  
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '10',
        '-hls_flags', 'delete_segments+append_list+discont_start',
        '-hls_segment_type', 'mpegts',
        '-hls_segment_filename', path.join(outputPath, 'segment_%d.ts'),
        '-hls_base_url', `/temp-streams/${streamId}/`,
        playlistPath
      ]);

      console.log('FFmpeg iniciado com comando:', ffmpeg.spawnargs.join(' '));

      let isFirstSegmentCreated = false;
      let lastSegmentTime = Date.now();
      let hasError = false;

      // Monitorar saúde do stream
      const checkStreamHealth = setInterval(() => {
        const now = Date.now();
        if ((isFirstSegmentCreated && now - lastSegmentTime > 15000) || hasError) {
          console.log('Stream com problemas, reiniciando...');
          ffmpeg.kill();
          clearInterval(checkStreamHealth);
          activeStreams.delete(streamId);
          if (fs.existsSync(outputPath)) {
            fs.rmSync(outputPath, { recursive: true, force: true });
          }
        }
      }, 10000);

      // Monitorar saída do FFmpeg
      ffmpeg.stderr.on('data', (data) => {
        console.log('FFmpeg output:', data.toString());
        
        if (data.toString().includes('segment_') && data.toString().includes('.ts')) {
          lastSegmentTime = Date.now();
          if (!isFirstSegmentCreated) {
            isFirstSegmentCreated = true;
            console.log('Primeiro segmento criado com sucesso');
          }
        }
        
        if (data.toString().includes('Error') || data.toString().includes('Invalid') || data.toString().includes('Failed')) {
          hasError = true;
        }
      });

      ffmpeg.on('error', (err) => {
        console.error('FFmpeg error:', err);
        hasError = true;
      });

      ffmpeg.on('exit', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        clearInterval(checkStreamHealth);
        activeStreams.delete(streamId);
        if (fs.existsSync(outputPath)) {
          fs.rmSync(outputPath, { recursive: true, force: true });
        }
      });

      activeStreams.set(streamId, ffmpeg);

      // Aguardar criação do primeiro segmento
      let attempts = 0;
      while (!isFirstSegmentCreated && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      if (!isFirstSegmentCreated) {
        ffmpeg.kill();
        clearInterval(checkStreamHealth);
        activeStreams.delete(streamId);
        if (fs.existsSync(outputPath)) {
          fs.rmSync(outputPath, { recursive: true, force: true });
        }
        return res.status(500).send('Failed to start stream');
      }
    }

    // Enviar playlist.m3u8
    if (fs.existsSync(playlistPath)) {
      res.set({
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });
      res.sendFile(playlistPath);
    } else {
      res.status(404).send('Playlist not found');
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});

// Cleanup on process exit
process.on('SIGINT', () => {
  for (const [streamId, ffmpeg] of activeStreams) {
    ffmpeg.kill();
    const outputPath = path.join(TEMP_DIR, streamId);
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true, force: true });
    }
  }
  process.exit();
});

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Servidor proxy Live rodando na porta ${PORT}`);
});
