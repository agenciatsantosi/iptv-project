import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import axiosRetry from 'axios-retry';

// Configurar retry para requisições
const client = axios.create({
  timeout: 30000,
  maxRedirects: 5
});

axiosRetry(client, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.code === 'ECONNRESET' ||
           error.code === 'ETIMEDOUT';
  }
});

// Cache para armazenar informações das streams
const streamCache = new Map<string, {
  url: string;
  lastAccessed: number;
  headers?: Record<string, string>;
}>();

// Limpa o cache periodicamente (a cada 1 hora)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of streamCache.entries()) {
    if (now - value.lastAccessed > 3600000) { // 1 hora
      streamCache.delete(key);
    }
  }
}, 3600000);

// Função para gerar um ID único para a stream
function generateStreamId(url: string): string {
  return createHash('md5').update(url).digest('hex');
}

// Função para validar a URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Forçar HTTPS
    const secureUrl = url.replace(/^http:/, 'https:');

    // Verificar se a URL é válida
    try {
      new URL(secureUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

    console.log('Fetching stream from:', secureUrl);

    const response = await client.get(secureUrl, {
      responseType: 'stream',
      headers: {
        ...req.headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    // Configurar headers de CORS e cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');

    // Copiar headers relevantes da resposta
    const relevantHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges'
    ];

    relevantHeaders.forEach(header => {
      const value = response.headers[header];
      if (value) {
        res.setHeader(header, value);
      }
    });

    // Definir status code
    res.status(response.status);

    // Pipe do stream
    return new Promise((resolve, reject) => {
      response.data.on('error', (error: Error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error occurred' });
        }
        reject(error);
      });

      response.data.pipe(res);

      response.data.on('end', () => {
        resolve(undefined);
      });

      // Tratar desconexão do cliente
      req.on('close', () => {
        response.data.destroy();
        resolve(undefined);
      });
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    if (!res.headersSent) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return res.status(error.response.status).json({
            error: `Upstream server error: ${error.response.status}`,
            details: error.message
          });
        } else if (error.request) {
          return res.status(502).json({
            error: 'Network error',
            details: error.message
          });
        }
      }
      
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 