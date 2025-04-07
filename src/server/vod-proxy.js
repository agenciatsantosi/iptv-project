import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();

// Criar diretório temp-streams se não existir
const tempDir = path.join(process.cwd(), 'temp-streams');
if (!fs.existsSync(tempDir)) {
  console.log('[VOD Proxy] Criando diretório temp-streams...');
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configuração CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'User-Agent', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges']
}));

app.get('/direct', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }

    console.log('[VOD Proxy] Recebida requisição para:', decodeURIComponent(url.toString()));

    // Verificar se a URL é válida
    try {
      new URL(decodeURIComponent(url.toString()));
    } catch (error) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const sourceUrl = decodeURIComponent(url.toString());
    
    // Gerar nome único para o arquivo temporário
    const tempFileName = `stream-${Date.now()}.mp4`;
    const tempFilePath = path.join(tempDir, tempFileName);

    console.log('[VOD Proxy] Iniciando conversão com FFmpeg...');
    console.log('[VOD Proxy] Caminho do arquivo temporário:', tempFilePath);
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    
    // Verificar se FFmpeg está instalado
    try {
      const ffmpegVersion = await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ['-version']);
        let output = '';
        ffmpeg.stdout.on('data', (data) => output += data);
        ffmpeg.on('close', (code) => code === 0 ? resolve(output) : reject());
        ffmpeg.on('error', reject);
      });
      console.log('[VOD Proxy] FFmpeg instalado:', ffmpegVersion.split('\n')[0]);
    } catch (error) {
      console.error('[VOD Proxy] FFmpeg não está instalado ou acessível');
      return res.status(500).json({ 
        error: 'FFmpeg não está instalado',
        message: 'O servidor não possui FFmpeg instalado.'
      });
    }
    
    // Iniciar FFmpeg para transcodificação
    const ffmpeg = spawn('ffmpeg', [
      '-y',                      // Sobrescrever arquivos de saída
      '-hide_banner',            // Oculta a mensagem de banner
      '-loglevel', 'info',       // Aumenta nível de log para debug
      '-i', sourceUrl,           // URL de entrada
      '-c:v', 'copy',            // Copia o vídeo sem recodificar
      '-c:a', 'copy',            // Copia o áudio sem recodificar
      '-f', 'mp4',               // Formato de saída
      '-movflags', 'frag_keyframe+empty_moov+faststart',  // Flags para streaming
      tempFilePath               // Arquivo temporário
    ]);
    
    console.log('[VOD Proxy] Processo FFmpeg iniciado');
    
    // Log de saída do FFmpeg
    ffmpeg.stdout.on('data', (data) => {
      console.log('[VOD Proxy] FFmpeg stdout:', data.toString());
    });
    
    // Log de erros do FFmpeg
    ffmpeg.stderr.on('data', (data) => {
      console.log('[VOD Proxy] FFmpeg stderr:', data.toString());
    });
    
    // Quando FFmpeg terminar
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('[VOD Proxy] Conversão FFmpeg concluída com sucesso');
        // Stream o arquivo convertido
        const fileStream = fs.createReadStream(tempFilePath);
        fileStream.pipe(res);
        
        // Limpar arquivo quando terminar
        fileStream.on('end', () => {
          fs.unlink(tempFilePath, (err) => {
            if (err) console.error('[VOD Proxy] Erro ao deletar arquivo temporário:', err);
            else console.log('[VOD Proxy] Arquivo temporário deletado:', tempFilePath);
          });
        });
      } else {
        console.error('[VOD Proxy] FFmpeg falhou com código:', code);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Falha na conversão do stream' });
        }
      }
    });
    
    // Tratamento de erros do FFmpeg
    ffmpeg.on('error', (error) => {
      console.error('[VOD Proxy] Erro no FFmpeg:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro no processamento do stream' });
      }
    });
    
    // Quando a conexão é fechada
    res.on('close', () => {
      console.log('[VOD Proxy] Conexão fechada, matando FFmpeg');
      ffmpeg.kill('SIGKILL');
      // Tentar deletar o arquivo temporário
      fs.unlink(tempFilePath, () => {});
    });

  } catch (error) {
    console.error('[VOD Proxy] Erro no proxy:', error);
    
    if (error.response) {
      console.error('[VOD Proxy] Detalhes do erro:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers
      });
      return res.status(error.response.status).json({
        error: `Erro na requisição: ${error.response.status} ${error.response.statusText}`
      });
    } else if (error.request) {
      console.error('[VOD Proxy] Erro na requisição (sem resposta):', error.message);
      return res.status(502).json({
        error: 'Erro ao conectar com o servidor de vídeo'
      });
    } else {
      console.error('[VOD Proxy] Erro geral:', error.message);
      return res.status(500).json({
        error: 'Erro interno no servidor proxy'
      });
    }
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`[VOD Proxy] Servidor rodando na porta ${port}`);
});
