import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { PassThrough } from 'stream';

const app = express();
const PORT = 3001;

// Configuração do CORS mais permissiva para desenvolvimento
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'User-Agent', 'Accept', 'Origin', 'Referer']
}));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[VOD Proxy] ${req.method} ${req.url}`);
  if (req.headers.range) {
    console.log('[VOD Proxy] Range:', req.headers.range);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Stream endpoint
app.get('/stream', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    console.error('[VOD Proxy] URL não fornecida');
    return res.status(400).send('URL não fornecida');
  }

  try {
    console.log(`[VOD Proxy] Iniciando stream para: ${url}`);
    
    // Headers padrão para todas as requisições
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Origin': 'http://localhost:5173',
      'Referer': 'http://localhost:5173/',
      'Connection': 'keep-alive'
    };

    // Se houver Range header, adiciona ao request
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
      console.log('[VOD Proxy] Usando range:', req.headers.range);
    }

    // Primeiro faz um HEAD request para obter informações do conteúdo
    try {
      console.log('[VOD Proxy] Fazendo HEAD request');
      const headResponse = await axios.head(url, { headers });
      console.log('[VOD Proxy] HEAD response:', {
        status: headResponse.status,
        contentType: headResponse.headers['content-type'],
        contentLength: headResponse.headers['content-length'],
        acceptRanges: headResponse.headers['accept-ranges']
      });
    } catch (headError) {
      console.warn('[VOD Proxy] HEAD request falhou:', headError.message);
    }

    // Configura o request
    console.log('[VOD Proxy] Iniciando GET request');
    const response = await axios({
      method: 'GET',
      url: url,
      headers: headers,
      responseType: 'stream',
      maxRedirects: 5,
      timeout: 30000,
      validateStatus: (status) => {
        return status >= 200 && status < 400;
      }
    });

    console.log('[VOD Proxy] GET response:', {
      status: response.status,
      headers: response.headers
    });

    // Configura headers de resposta
    const contentType = response.headers['content-type'] || 'video/mp4';
    const contentLength = response.headers['content-length'];
    
    const responseHeaders = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, User-Agent, Accept, Origin, Referer'
    };

    // Se tiver content-length, adiciona
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    // Se for uma requisição com Range
    if (req.headers.range && response.headers['content-range']) {
      res.status(206);
      responseHeaders['Content-Range'] = response.headers['content-range'];
    } else {
      res.status(200);
    }

    // Define os headers
    res.set(responseHeaders);

    // Cria um stream de passagem para melhor controle
    const passThrough = new PassThrough();

    // Pipe do stream com tratamento de erro
    response.data
      .on('error', (error) => {
        console.error('[VOD Proxy] Erro no stream de entrada:', error);
        passThrough.end();
      })
      .pipe(passThrough)
      .on('error', (error) => {
        console.error('[VOD Proxy] Erro no stream de saída:', error);
        if (!res.headersSent) {
          res.status(500).send('Erro no stream de vídeo');
        }
      });

    // Pipe para a resposta
    passThrough.pipe(res);

    // Cleanup quando a conexão for fechada
    req.on('close', () => {
      console.log('[VOD Proxy] Conexão fechada pelo cliente');
      response.data.destroy();
      passThrough.destroy();
    });

    // Monitora o progresso do stream
    let bytesSent = 0;
    passThrough.on('data', (chunk) => {
      bytesSent += chunk.length;
      if (bytesSent % (1024 * 1024) === 0) { // Log a cada 1MB
        console.log(`[VOD Proxy] Bytes enviados: ${bytesSent / (1024 * 1024)}MB`);
      }
    });

  } catch (error) {
    console.error('[VOD Proxy] Erro:', error.message);
    
    if (error.response) {
      console.error('[VOD Proxy] Status:', error.response.status);
      console.error('[VOD Proxy] Headers:', error.response.headers);
    }
    
    if (!res.headersSent) {
      res.status(500).send('Erro ao processar stream de vídeo');
    }
  }
});

app.listen(PORT, () => {
  console.log(`[VOD Proxy] Servidor rodando na porta ${PORT}`);
});
