import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { createHash } from 'crypto';

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
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

  // Responder a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, type = 'video' } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const streamId = generateStreamId(url);

    // Verificar se já temos informações dessa stream no cache
    const cachedStream = streamCache.get(streamId);
    if (cachedStream) {
      cachedStream.lastAccessed = Date.now();
      
      // Se for uma requisição de range, fazer proxy direto
      if (req.headers.range) {
        const response = await axios({
          method: 'GET',
          url: cachedStream.url,
          headers: {
            ...req.headers,
            host: new URL(cachedStream.url).host
          },
          responseType: 'stream'
        });

        res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');
        res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Content-Range', response.headers['content-range']);
        res.setHeader('Accept-Ranges', 'bytes');
        
        return response.data.pipe(res);
      }

      return res.json({
        streamId,
        url: cachedStream.url,
        type
      });
    }

    // Fazer a primeira requisição para obter informações do stream
    const response = await axios({
      method: 'HEAD',
      url: url,
      timeout: 5000,
      maxRedirects: 5
    });

    // Armazenar no cache
    streamCache.set(streamId, {
      url: url,
      lastAccessed: Date.now(),
      headers: response.headers as Record<string, string>
    });

    // Retornar informações do stream
    return res.json({
      streamId,
      url: url,
      type,
      headers: {
        'Content-Type': response.headers['content-type'],
        'Content-Length': response.headers['content-length']
      }
    });

  } catch (error) {
    console.error('Erro no servidor de streaming:', error);
    return res.status(500).json({
      error: 'Erro ao processar stream',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
} 