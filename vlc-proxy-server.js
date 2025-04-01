import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3002;

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'HEAD', 'OPTIONS', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Range', 'User-Agent', 'X-Requested-With']
}));

// Armazena as conexões ativas
const activeStreams = new Map();

// Função para iniciar o VLC e transmitir
function startVLCStream(url, ws) {
  console.log('Iniciando stream VLC:', url);

  const vlc = spawn('vlc', [
    url,
    '--sout', '#transcode{vcodec=h264,acodec=mp3,ab=128,channels=2,samplerate=44100}:standard{access=http,mux=ts,dst=:8081}',
    '--sout-keep',
    '--no-video-title-show',
    '--no-spu',
    '--no-osd',
    '--no-repeat',
    '--no-loop',
    '--play-and-exit',
    '-I', 'dummy'
  ]);

  vlc.stdout.on('data', (data) => {
    console.log('VLC output:', data.toString());
  });

  vlc.stderr.on('data', (data) => {
    console.log('VLC log:', data.toString());
  });

  vlc.on('error', (error) => {
    console.error('VLC error:', error);
    ws.send(JSON.stringify({ type: 'error', message: error.message }));
  });

  vlc.on('close', (code) => {
    console.log('VLC process exited with code:', code);
    ws.send(JSON.stringify({ type: 'close', code }));
  });

  return vlc;
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'start' && data.url) {
        // Para cada nova solicitação, inicia um novo processo VLC
        const vlcProcess = startVLCStream(data.url, ws);
        
        // Armazena o processo para limpeza posterior
        activeStreams.set(ws, vlcProcess);
        
        // Envia a URL do stream local
        ws.send(JSON.stringify({
          type: 'ready',
          url: 'http://localhost:8081'
        }));
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Conexão WebSocket fechada');
    const vlcProcess = activeStreams.get(ws);
    if (vlcProcess) {
      vlcProcess.kill();
      activeStreams.delete(ws);
    }
  });
});

// Rota de status
app.get('/status', (req, res) => {
  res.json({
    activeConnections: wss.clients.size,
    activeStreams: activeStreams.size
  });
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`VLC proxy server running on http://localhost:${PORT}`);
});
