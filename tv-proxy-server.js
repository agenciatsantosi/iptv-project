import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const PORT = 3002;

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'HEAD', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['*']
}));

// Armazena os processos ativos do FFmpeg
const activeStreams = new Map();

// Função para limpar streams antigos
function cleanupStream(streamId) {
  const process = activeStreams.get(streamId);
  if (process) {
    process.kill('SIGKILL');
    activeStreams.delete(streamId);
    console.log(`Stream ${streamId} finalizado`);
  }
}

// Rota para streaming
app.get('/stream', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const streamId = Buffer.from(url.toString()).toString('base64');
    
    // Limpa stream anterior se existir
    cleanupStream(streamId);

    // Headers para streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Configuração do FFmpeg para converter o stream
    const ffmpeg = spawn('ffmpeg', [
      '-i', decodeURIComponent(url.toString()),
      '-c:v', 'libx264',         // Codec de vídeo H.264
      '-preset', 'ultrafast',     // Preset mais rápido
      '-tune', 'zerolatency',     // Otimizado para streaming
      '-c:a', 'aac',             // Codec de áudio AAC
      '-ac', '2',                // 2 canais de áudio
      '-b:a', '128k',            // Bitrate do áudio
      '-ar', '44100',            // Sample rate do áudio
      '-f', 'mp4',               // Formato de saída
      '-movflags', 'frag_keyframe+empty_moov+faststart',  // Flags para streaming
      '-g', '30',                // Keyframe a cada 30 frames
      '-bufsize', '2000k',       // Tamanho do buffer
      '-maxrate', '1500k',       // Taxa máxima de bits
      '-crf', '28',              // Qualidade do vídeo (menor = melhor)
      '-pipe:1'                  // Saída para pipe
    ]);

    // Pipe da saída do FFmpeg para a resposta HTTP
    ffmpeg.stdout.pipe(res);

    // Tratamento de erros do FFmpeg
    ffmpeg.stderr.on('data', (data) => {
      console.log('FFmpeg Log:', data.toString());
    });

    // Armazena o processo
    activeStreams.set(streamId, ffmpeg);

    // Quando a conexão é fechada
    res.on('close', () => {
      cleanupStream(streamId);
    });

    // Tratamento de erros do FFmpeg
    ffmpeg.on('error', (error) => {
      console.error('FFmpeg Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro no processamento do stream' });
      }
      cleanupStream(streamId);
    });

  } catch (error) {
    console.error('Erro:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro no servidor',
        message: error.message
      });
    }
  }
});

// Rota de status
app.get('/status', (req, res) => {
  res.json({
    activeStreams: activeStreams.size
  });
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`TV proxy server running on http://localhost:${PORT}`);
});
