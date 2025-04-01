import * as express from 'express';
import axios from 'axios';
import * as cors from 'cors';
import { URL } from 'url';
import * as http from 'http';
import * as https from 'https';

const app = express.default();

// Configuração CORS e limites
app.use(cors.default());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Headers de segurança
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});

// Função para extrair credenciais da URL
function extractCredentials(url: string) {
  const match = url.match(/\/(\d+)\/(\d+)\//);
  return match ? { username: match[1], password: match[2] } : null;
}

// Função para criar agentes HTTP/HTTPS com timeouts
const httpAgent = new http.Agent({
  keepAlive: true,
  timeout: 60000,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 60000,
  rejectUnauthorized: false
});

// Endpoint principal para streaming
app.get('/stream', async (req, res) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    console.log('URL inicial:', decodedUrl);
    
    // Extrai credenciais da URL
    const credentials = extractCredentials(decodedUrl);
    const urlObj = new URL(decodedUrl);
    
    // Headers específicos para IPTV
    const headers = {
      'User-Agent': 'VLC/3.0.8 LibVLC/3.0.8',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Range': req.headers.range || 'bytes=0-',
      'Host': urlObj.host
    };

    // Se encontrou credenciais, adiciona autenticação
    if (credentials) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
    }

    // Configuração do request
    const requestOptions = {
      method: 'GET',
      url: decodedUrl,
      headers,
      responseType: 'stream' as const,
      maxRedirects: 10,
      timeout: 60000,
      httpAgent,
      httpsAgent,
      decompress: true,
      validateStatus: (status: number) => status >= 200 && status < 500
    };

    console.log('Iniciando request com headers:', headers);
    const response = await axios(requestOptions);
    console.log('Stream iniciado com sucesso');

    // Headers para a resposta
    const responseHeaders = {
      'Content-Type': response.headers['content-type'] || 'application/octet-stream',
      'Content-Length': response.headers['content-length'],
      'Accept-Ranges': 'bytes',
      'Content-Range': response.headers['content-range'],
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // Configura a resposta
    res.writeHead(response.status || 200, responseHeaders);

    // Pipe do stream com tratamento de erro
    const stream = response.data.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Erro no stream:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro no stream de dados' });
      }
    });

    // Cleanup
    req.on('close', () => {
      console.log('Conexão fechada pelo cliente');
      stream.destroy();
    });

  } catch (error: any) {
    console.error('Erro no proxy:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao processar stream',
        details: error.message,
        url: decodeURIComponent(url as string)
      });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
});
