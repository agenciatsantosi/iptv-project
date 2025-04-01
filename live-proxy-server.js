import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const app = express();
const PORT = 3002;

// Configurações do servidor
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range', 'Accept', 'Accept-Language', 'Origin', 'User-Agent']
}));

app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mapa para armazenar processos FFmpeg ativos
const activeProcesses = new Map();

// Função para limpar processo e arquivos
function cleanup(processId) {
  const process = activeProcesses.get(processId);
  if (process) {
    process.kill();
    activeProcesses.delete(processId);
    // Limpar arquivos temporários
    const tempDir = process.tempDir;
    if (tempDir) {
      fs.rm(tempDir, { recursive: true, force: true }, (err) => {
        if (err) console.error('Erro ao limpar diretório temporário:', err);
      });
    }
  }
}

// Função para seguir redirecionamentos
async function followRedirects(url, headers, maxRedirects = 5) {
  let currentUrl = url;
  let redirectCount = 0;
  let finalResponse = null;

  while (redirectCount < maxRedirects) {
    try {
      console.log(`Tentando URL: ${currentUrl}`);
      const response = await axios({
        method: 'get',
        url: currentUrl,
        headers: {
          ...headers,
          'host': new URL(currentUrl).host,
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        responseType: 'stream'
      });

      if (response.status === 200) {
        console.log('Sucesso! URL final:', currentUrl);
        finalResponse = response;
        break;
      }

      if (response.headers.location) {
        currentUrl = new URL(response.headers.location, currentUrl).href;
        redirectCount++;
        console.log(`Redirecionando para: ${currentUrl}`);
      } else {
        finalResponse = response;
        break;
      }
    } catch (error) {
      if (error.response?.headers?.location) {
        currentUrl = new URL(error.response.headers.location, currentUrl).href;
        redirectCount++;
        console.log(`Redirecionando após erro para: ${currentUrl}`);
      } else {
        throw error;
      }
    }
  }

  if (!finalResponse) {
    throw new Error('Máximo de redirecionamentos excedido');
  }

  return { response: finalResponse, finalUrl: currentUrl };
}

// Rota para streaming
app.get('/stream', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    console.error('URL não fornecida');
    return res.status(400).json({ 
      success: false,
      error: 'URL parameter is required' 
    });
  }

  try {
    const sourceUrl = decodeURIComponent(url.toString());
    console.log('URL inicial:', sourceUrl);
    
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Range': req.headers.range,
      ...req.headers,
      'host': new URL(sourceUrl).host,
      'origin': new URL(sourceUrl).origin,
      'referer': new URL(sourceUrl).origin
    };

    // Seguir redirecionamentos mantendo os headers
    const { response, finalUrl } = await followRedirects(sourceUrl, requestHeaders);
    console.log('URL final após redirecionamentos:', finalUrl);
    console.log('Content-Type:', response.headers['content-type']);

    // Verificar se é um stream HLS
    const contentType = response.headers['content-type']?.toLowerCase() || '';
    const isHLS = contentType.includes('application/vnd.apple.mpegurl') || 
                 contentType.includes('application/x-mpegurl') ||
                 finalUrl.toLowerCase().endsWith('.m3u8');

    if (isHLS) {
      console.log('Stream HLS detectado, retornando URL direta');
      return res.json({
        success: true,
        type: 'hls',
        url: finalUrl,
        directPlay: true
      });
    }

    // Se o content-type não for suportado, converter com FFmpeg
    if (!contentType.includes('mp4')) {
      console.log('Convertendo stream com FFmpeg');
      
      // Criar ID único para o processo
      const processId = Date.now().toString();
      const tempDir = path.join(os.tmpdir(), 'live-streams', Buffer.from(url).toString('base64'));
      
      // Garantir que o diretório existe
      await fs.promises.mkdir(tempDir, { recursive: true });
      
      const ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-f', 'hls',
        '-hls_time', '4',
        '-hls_list_size', '3',
        '-hls_flags', 'delete_segments',
        path.join(tempDir, 'playlist.m3u8')
      ]);

      // Armazenar processo e informações
      ffmpeg.tempDir = tempDir;
      activeProcesses.set(processId, ffmpeg);

      // Pipe do stream original para FFmpeg
      response.data.pipe(ffmpeg.stdin);

      ffmpeg.stderr.on('data', (data) => {
        console.log('[ffmpeg output]:', data.toString());
      });

      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        cleanup(processId);
      });

      // Esperar um pouco para garantir que o arquivo m3u8 foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se o arquivo m3u8 foi criado
      const playlistPath = path.join(tempDir, 'playlist.m3u8');
      try {
        await fs.promises.access(playlistPath);
        // Enviar resposta com o ID do processo e URL do playlist
        const playlistUrl = `/stream/playlist/${processId}/playlist.m3u8?url=${encodeURIComponent(url)}`;
        res.json({ 
          success: true,
          processId, 
          playlistUrl,
          type: 'hls'
        });
      } catch (err) {
        cleanup(processId);
        throw new Error('Falha ao criar playlist HLS');
      }
    } else {
      // Se o formato já for suportado, fazer streaming direto
      res.json({ 
        success: true,
        url: finalUrl,
        type: 'mp4'
      });
    }
  } catch (error) {
    console.error('Erro no streaming:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal Server Error' 
    });
  }
});

// Rota para parar o processo FFmpeg
app.post('/stream/stop', (req, res) => {
  const { processId } = req.body;
  
  if (!processId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Process ID is required' 
    });
  }

  try {
    cleanup(processId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao parar processo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    });
  }
});

// Rota para servir os arquivos HLS
app.get('/stream/playlist/:processId/:file', (req, res) => {
  const { processId, file } = req.params;
  const { url } = req.query;

  if (!processId || !file) {
    return res.status(400).json({ 
      success: false, 
      error: 'Process ID and file name are required' 
    });
  }

  try {
    const tempDir = path.join(os.tmpdir(), 'live-streams', Buffer.from(url).toString('base64'));
    const filePath = path.join(tempDir, file);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }

    // Configurar headers para streaming
    res.setHeader('Content-Type', file.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Enviar o arquivo
    res.sendFile(filePath);
  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    });
  }
});

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('Erro ao iniciar servidor:', error);
});

process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  // Limpa todos os processos FFmpeg ativos
  for (const [processId] of activeProcesses) {
    cleanup(processId);
  }
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
