import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { URL } from 'url';
import * as http from 'http';
import * as https from 'https';

// Função para extrair credenciais da URL
function extractCredentials(url: string) {
  const match = url.match(/\/(\d+)\/(\d+)\//);
  return match ? { username: match[1], password: match[2] } : null;
}

// Cache para armazenar headers de resposta
const responseHeadersCache = new Map();

// Agentes HTTP/HTTPS com timeouts e keep-alive otimizados
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 100,
  timeout: 60000,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 100,
  timeout: 60000,
  rejectUnauthorized: false
});

// Função para otimizar headers de resposta
function optimizeResponseHeaders(headers: any, url: string) {
  const cachedHeaders = responseHeadersCache.get(url);
  if (cachedHeaders) {
    return cachedHeaders;
  }

  const optimizedHeaders = {
    'Content-Type': headers['content-type'] || 'application/octet-stream',
    'Content-Length': headers['content-length'],
    'Accept-Ranges': 'bytes',
    'Content-Range': headers['content-range'],
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cache-Control': 'public, max-age=31536000',
    'Transfer-Encoding': 'chunked',
    'Connection': 'keep-alive'
  };

  responseHeadersCache.set(url, optimizedHeaders);
  return optimizedHeaders;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Otimização para CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    const credentials = extractCredentials(decodedUrl);
    const urlObj = new URL(decodedUrl);
    
    const headers = {
      'User-Agent': 'VLC/3.0.8 LibVLC/3.0.8',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Range': req.headers.range || 'bytes=0-',
      'Host': urlObj.host
    };

    if (credentials) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
    }

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

    const response = await axios(requestOptions);
    
    // Otimiza os headers de resposta
    const responseHeaders = optimizeResponseHeaders(response.headers, decodedUrl);
    res.writeHead(response.status || 200, responseHeaders);

    // Configura o streaming otimizado
    const stream = response.data;
    
    // Configura buffer de alta performance
    stream.on('data', (chunk: Buffer) => {
      if (!res.write(chunk)) {
        stream.pause();
      }
    });

    stream.on('end', () => {
      res.end();
    });

    res.on('drain', () => {
      stream.resume();
    });

    // Tratamento de erros otimizado
    stream.on('error', (error: Error) => {
      console.error('Erro no stream:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro no stream de dados' });
      }
      stream.destroy();
    });

    req.on('close', () => {
      stream.destroy();
      responseHeadersCache.delete(decodedUrl);
    });

  } catch (error: any) {
    console.error('Erro no proxy:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao processar stream',
        details: error.message,
        url: decodeURIComponent(url)
      });
    }
  }
} 