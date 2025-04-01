import * as express from 'express';
import * as cors from 'cors';
import axios from 'axios';

const app = express.default();

// Configuração CORS
app.use(cors.default({
  origin: true,
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges', 'Content-Type']
}));

// Middleware para headers de segurança
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});

// Proxy para imagens
app.get('/image-proxy', async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: decodeURIComponent(url),
      responseType: 'arraybuffer',
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Headers CORS e segurança
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    // Copiar headers relevantes
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    res.send(response.data);
  } catch (error) {
    console.error('Erro no proxy de imagem:', error);
    res.status(500).json({ error: 'Erro ao carregar imagem' });
  }
});

// Proxy para vídeos
app.get('/video-proxy', async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  try {
    const decodedUrl = decodeURIComponent(url);

    // Fazer a requisição direta do vídeo
    const response = await axios({
      method: 'GET',
      url: decodedUrl,
      responseType: 'stream',
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Range': req.headers.range || 'bytes=0-'
      }
    });

    // Copiar headers relevantes
    const headers = response.headers;
    
    res.setHeader('Content-Type', headers['content-type'] || 'video/mp4');
    if (headers['content-length']) {
      res.setHeader('Content-Length', headers['content-length']);
    }
    if (headers['content-range']) {
      res.setHeader('Content-Range', headers['content-range']);
    }
    if (headers['accept-ranges']) {
      res.setHeader('Accept-Ranges', headers['accept-ranges']);
    }

    // Headers CORS e segurança
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

    // Status code
    res.status(response.status);

    // Pipe da resposta para o cliente
    response.data.pipe(res);

    // Cleanup
    req.on('close', () => {
      response.data.destroy();
    });

  } catch (error: any) {
    console.error('Erro no proxy de vídeo:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Erro ao processar o vídeo',
        details: error.message
      });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});