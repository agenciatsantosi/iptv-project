import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// Configuração de processo
process.on('uncaughtException', (err) => {
  console.error('[VOD Proxy] Erro não tratado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('[VOD Proxy] Promise rejeitada não tratada:', err);
});

// Diretório para arquivos temporários
const TEMP_DIR = path.join(__dirname, '../../temp-streams');

// Criar diretório temporário se não existir
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Configurações
const TIMEOUT_PLAYLIST = 15000; // 15 segundos para playlist
const STREAM_INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 min sem acesso
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 min para limpeza

// Interface para streams ativos
interface ActiveStream {
  url: string;
  hlsDir: string;
  process: ChildProcess | null;
  createdAt: number;
  lastAccess: number;
  clients: number;
  error?: string;
  ready: boolean;
}

// Map de streams ativos
const activeStreams = new Map<string, ActiveStream>();

// Configuração CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept']
}));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[VOD Proxy] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  const status = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    activeStreams: activeStreams.size
  };
  res.status(200).json(status);
});

// Função para gerar um ID único de stream
function generateStreamId(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

// Função para verificar se uma URL é acessível
async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    // Primeiro tenta um HEAD request para economizar banda
    await axios.head(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return true;
  } catch (error) {
    try {
      // Se HEAD falhar, tenta GET com range para minimizar dados
      await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Range': 'bytes=0-1024'
        }
      });
      return true;
    } catch (error) {
      console.error(`[VOD Proxy] URL inacessível: ${url}`, error.message);
      return false;
    }
  }
}

// Função para iniciar um stream HLS
function startHLSStream(url: string, streamId: string): Promise<ActiveStream> {
  return new Promise((resolve, reject) => {
    const hlsDir = path.join(TEMP_DIR, streamId);
    
    // Cria diretório para o stream
    if (!fs.existsSync(hlsDir)) {
      fs.mkdirSync(hlsDir, { recursive: true });
    }
    
    const playlistPath = path.join(hlsDir, 'index.m3u8');
    
    // Remover arquivo de playlist se existir (para caso de streams reiniciados)
    if (fs.existsSync(playlistPath)) {
      try {
        fs.unlinkSync(playlistPath);
      } catch (err) {
        console.warn(`[VOD Proxy] Erro ao remover playlist antiga: ${err.message}`);
      }
    }
    
    // Configuração FFmpeg para HLS
    const ffmpegArgs = [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', url,
      '-c:v', 'libx264',          // Converter vídeo para H.264
      '-preset', 'veryfast',      // Preset rápido para transcodificação
      '-profile:v', 'main',       // Perfil compatível com a maioria dos dispositivos
      '-level', '4.0',            // Nível compatível com maioria dos dispositivos  
      '-crf', '23',               // Qualidade razoável
      '-c:a', 'aac',              // Converter áudio para AAC com ADTS headers
      '-b:a', '128k',             // Bitrate de áudio fixo
      '-ar', '44100',             // Sample rate fixo
      '-f', 'hls',                // Formato HLS
      '-hls_time', '2',           // Duração menor para inicialização mais rápida
      '-hls_list_size', '5',      // Número de segmentos na playlist
      '-hls_flags', 'delete_segments+append_list+omit_endlist',  // Flags para streaming contínuo
      '-hls_segment_filename', path.join(hlsDir, 'segment_%03d.ts'),  // Padrão de nome dos segmentos
      playlistPath                // Caminho da playlist
    ];
    
    console.log(`[VOD Proxy] Iniciando stream HLS para ${url}`);
    console.log(`[VOD Proxy] FFmpeg args: ${ffmpegArgs.join(' ')}`);
    
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    
    // Registrar erros e saída do FFmpeg
    ffmpeg.stderr?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`[VOD Proxy] FFmpeg: ${output}`);
    });
    
    // Criar registro de stream ativo
    const activeStream: ActiveStream = {
      url,
      hlsDir,
      process: ffmpeg,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      clients: 1,
      ready: false
    };
    
    // Registrar o stream no mapa
    activeStreams.set(streamId, activeStream);
    
    // Verificar se o arquivo de playlist foi criado 
    const checkInterval = setInterval(() => {
      if (fs.existsSync(playlistPath)) {
        // Verifica se não é apenas um arquivo vazio
        try {
          const stats = fs.statSync(playlistPath);
          if (stats.size > 0) {
            clearInterval(checkInterval);
            activeStream.ready = true;
            resolve(activeStream);
            return;
          }
        } catch (err) {
          console.warn(`[VOD Proxy] Erro ao verificar playlist: ${err.message}`);
        }
      }
    }, 500);
    
    // Timeout para o caso da playlist não ser criada
    setTimeout(() => {
      clearInterval(checkInterval);
      
      if (!activeStream.ready) {
        console.error(`[VOD Proxy] Timeout ao aguardar playlist para ${url}`);
        
        // Mata o processo FFmpeg se ele ainda estiver rodando
        if (activeStream.process) {
          try {
            activeStream.process.kill('SIGKILL');
            activeStream.process = null;
          } catch (err) {
            console.error(`[VOD Proxy] Erro ao matar processo: ${err.message}`);
          }
        }
        
        // Marca o stream com erro
        activeStream.error = 'Timeout ao criar playlist HLS';
        
        reject(new Error('Timeout ao criar playlist HLS'));
      }
    }, TIMEOUT_PLAYLIST);
    
    // Lidar com a saída do processo
    ffmpeg.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      console.log(`[VOD Proxy] FFmpeg para ${streamId} encerrou com código ${code} e sinal ${signal}`);
      
      clearInterval(checkInterval);
      
      // Atualiza o status do stream
      if (activeStreams.has(streamId)) {
        const stream = activeStreams.get(streamId)!;
        stream.process = null;
        
        // Se o stream encerrou antes de ficar pronto, marca como erro
        if (!stream.ready) {
          stream.error = `FFmpeg encerrou com código ${code}`;
          reject(new Error(stream.error));
        }
      }
    });
    
    // Gerenciar eventos do processo
    ffmpeg.on('error', (err: Error) => {
      console.error(`[VOD Proxy] Erro FFmpeg para ${streamId}:`, err);
      
      clearInterval(checkInterval);
      
      if (activeStreams.has(streamId)) {
        const stream = activeStreams.get(streamId)!;
        stream.error = err.message;
        stream.process = null;
      }
      
      reject(err);
    });
  });
}

// Função para obter ou iniciar um stream
async function getOrCreateStream(url: string): Promise<ActiveStream> {
  const streamId = generateStreamId(url);
  
  // Verifica se já existe um stream ativo
  if (activeStreams.has(streamId)) {
    const stream = activeStreams.get(streamId)!;
    
    // Se o stream tem erro ou o processo morreu, e há um novo cliente, tenta reiniciar
    if ((stream.error || !stream.process) && stream.clients === 0) {
      console.log(`[VOD Proxy] Tentando reiniciar stream com erro: ${streamId}`);
      
      // Remove o stream antigo do mapa
      activeStreams.delete(streamId);
      
      // Tenta iniciar um novo
      return startHLSStream(url, streamId);
    }
    
    // Atualiza timestamp e contador de clientes
    stream.lastAccess = Date.now();
    stream.clients++;
    
    console.log(`[VOD Proxy] Reutilizando stream ${streamId}, clientes: ${stream.clients}`);
    
    // Se já está pronto, retorna imediatamente
    if (stream.ready && !stream.error) {
      return stream;
    }
    
    // Se tem erro, retorna o erro
    if (stream.error) {
      throw new Error(stream.error);
    }
    
    // Se não está pronto, espera ficar pronto ou dar erro
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!activeStreams.has(streamId)) {
          clearInterval(checkInterval);
          reject(new Error('Stream foi removido'));
          return;
        }
        
        const currentStream = activeStreams.get(streamId)!;
        
        if (currentStream.ready) {
          clearInterval(checkInterval);
          resolve(currentStream);
        } else if (currentStream.error) {
          clearInterval(checkInterval);
          reject(new Error(currentStream.error));
        }
      }, 500);
      
      // Timeout para não ficar esperando infinitamente
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout ao aguardar stream ficar pronto'));
      }, TIMEOUT_PLAYLIST);
    });
  }
  
  // Verifica se a URL é acessível antes de tentar criar o stream
  const isAccessible = await isUrlAccessible(url);
  if (!isAccessible) {
    throw new Error(`URL não acessível: ${url}`);
  }
  
  // Inicia um novo stream
  try {
    const stream = await startHLSStream(url, streamId);
    console.log(`[VOD Proxy] Novo stream ${streamId} iniciado com sucesso`);
    return stream;
  } catch (error) {
    console.error(`[VOD Proxy] Erro ao iniciar stream ${streamId}:`, error);
    throw error;
  }
}

// Endpoint para obter URL da playlist HLS
app.get('/stream', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL não fornecida ou inválida' });
    }

    console.log('[VOD Proxy] Solicitação de stream para:', url);
    
    try {
      const stream = await getOrCreateStream(url);
      const streamId = generateStreamId(url);
      const playlistUrl = `/hls/${streamId}/index.m3u8`;
      
      res.json({
        url: playlistUrl,
        type: 'application/x-mpegURL',
        streamId
      });
    } catch (error) {
      console.error('[VOD Proxy] Erro ao iniciar stream:', error);
      res.status(500).json({ error: error.message || 'Erro ao iniciar stream' });
    }
  } catch (error: any) {
    console.error('[VOD Proxy] Erro no endpoint stream:', error.message);
    res.status(500).json({ error: 'Erro interno no servidor proxy' });
  }
});

// Endpoint para liberar um cliente
app.get('/release/:streamId', (req, res) => {
  const { streamId } = req.params;
  
  if (activeStreams.has(streamId)) {
    const stream = activeStreams.get(streamId)!;
    
    // Decrementa o contador de clientes
    if (stream.clients > 0) {
      stream.clients--;
    }
    
    console.log(`[VOD Proxy] Stream ${streamId} liberado, clientes restantes: ${stream.clients}`);
    
    // Se não há mais clientes, mata o processo FFmpeg
    if (stream.clients === 0 && stream.process) {
      console.log(`[VOD Proxy] Encerrando processo FFmpeg para stream ${streamId} pois não há mais clientes`);
      try {
        stream.process.kill('SIGKILL');
        stream.process = null;
      } catch (error) {
        console.error(`[VOD Proxy] Erro ao matar processo FFmpeg:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      clients: stream.clients 
    });
  } else {
    res.status(404).json({ error: 'Stream não encontrado' });
  }
});

// Redirecionar /direct para /stream para compatibilidade
app.get('/direct', (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }
  
  res.redirect(`/stream?url=${encodeURIComponent(url)}`);
});

// Endpoint para servir arquivos HLS
app.get('/hls/:streamId/:file', (req, res) => {
  const { streamId, file } = req.params;
  const filePath = path.join(TEMP_DIR, streamId, file);

  // Atualiza timestamp de acesso
  if (activeStreams.has(streamId)) {
    const stream = activeStreams.get(streamId)!;
    stream.lastAccess = Date.now();
  }

  // Verifica se o arquivo existe
  if (!fs.existsSync(filePath)) {
    console.log(`[VOD Proxy] Arquivo não encontrado: ${filePath}`);
    return res.status(404).send('Arquivo não encontrado');
  }

  // Configura headers com base no tipo de arquivo
  if (file.endsWith('.m3u8')) {
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else if (file.endsWith('.ts')) {
    res.setHeader('Content-Type', 'video/mp2t');
    res.setHeader('Cache-Control', 'max-age=86400');
  }

  // Envia o arquivo
  res.sendFile(filePath);
});

// Limpeza periódica de streams inativos
function cleanupInactiveStreams() {
  const now = Date.now();
  
  console.log(`[VOD Proxy] Iniciando limpeza de streams inativos. Ativos: ${activeStreams.size}`);
  
  for (const [streamId, stream] of activeStreams.entries()) {
    // Remove streams inativos
    if (now - stream.lastAccess > STREAM_INACTIVE_TIMEOUT || (stream.error && stream.clients === 0)) {
      console.log(`[VOD Proxy] Removendo stream inativo: ${streamId}, último acesso: ${Math.round((now - stream.lastAccess) / 1000)}s atrás`);
      
      // Mata o processo se ainda estiver rodando
      if (stream.process) {
        try {
          stream.process.kill('SIGKILL');
        } catch (err) {
          console.error(`[VOD Proxy] Erro ao matar processo: ${err.message}`);
        }
      }
      
      // Remove do mapa
      activeStreams.delete(streamId);
      
      // Tenta remover arquivos
      try {
        if (fs.existsSync(stream.hlsDir)) {
          fs.rmSync(stream.hlsDir, { recursive: true, force: true });
        }
      } catch (err) {
        console.error(`[VOD Proxy] Erro ao remover diretório: ${err.message}`);
      }
    }
  }
}

// Configura limpeza periódica
setInterval(cleanupInactiveStreams, CLEANUP_INTERVAL);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[VOD Proxy] Servidor rodando na porta ${PORT}`);
  console.log(`[VOD Proxy] Diretório de streams: ${TEMP_DIR}`);
});

export default app;

