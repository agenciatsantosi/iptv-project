import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3000;

// Lista de domínios alternativos
const ALTERNATIVE_DOMAINS = [
  'motoplatxrd.com:80',
  'brqnt.pro:80',
  'onefr.xplatrd.com:8080'
];

// Configuração CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges', 'Content-Type']
}));

// Headers de segurança
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});

// Função para processar URL do stream
function processStreamUrl(url, type) {
  try {
    const decodedUrl = decodeURIComponent(url);
    const urlParts = new URL(decodedUrl);
    const pathParts = urlParts.pathname.split('/');
    
    // Extrair credenciais da URL original
    let username, password;
    if (pathParts.length >= 4) {
      username = pathParts[2];
      password = pathParts[3];
    } else {
      throw new Error('URL inválida: credenciais não encontradas');
    }

    // Construir URL baseada no tipo
    switch (type) {
      case 'live':
        const channelId = pathParts[4]?.replace(/\.(m3u8|ts|mp4)$/, '');
        if (!channelId) throw new Error('ID do canal não encontrado');
        return `http://motoplatxrd.com:80/${username}/${password}/${channelId}.m3u8`;
      
      case 'series':
        const seriesId = pathParts[4];
        const episodeId = pathParts[5]?.replace(/\.(m3u8|ts|mp4)$/, '');
        if (!seriesId || !episodeId) throw new Error('ID da série ou episódio não encontrado');
        return `http://motoplatxrd.com:80/series/${username}/${password}/${seriesId}/${episodeId}.mp4`;
      
      case 'movie':
        const movieId = pathParts[4]?.replace(/\.(m3u8|ts|mp4)$/, '');
        if (!movieId) throw new Error('ID do filme não encontrado');
        return `http://motoplatxrd.com:80/movie/${username}/${password}/${movieId}.mp4`;
      
      default:
        throw new Error('Tipo de conteúdo inválido');
    }
  } catch (error) {
    console.error('Erro ao processar URL:', error);
    throw error;
  }
}

// Função para tentar diferentes domínios
async function tryAlternativeDomains(url, type, customHeaders) {
  const errors = [];

  for (const domain of ALTERNATIVE_DOMAINS) {
    try {
      const modifiedUrl = url.replace('motoplatxrd.com:80', domain);
      console.log('Tentando domínio:', domain);
      
      const response = await axios({
        method: 'get',
        url: modifiedUrl,
        headers: customHeaders,
        responseType: 'stream',
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      if (response.status === 200 || response.status === 206) {
        console.log('Sucesso com domínio:', domain);
        return response;
      }

      errors.push(`${domain}: Status ${response.status}`);
    } catch (error) {
      console.warn(`Erro com domínio ${domain}:`, error.message);
      errors.push(`${domain}: ${error.message}`);
      continue;
    }
  }

  throw new Error(`Nenhum domínio funcionou. Erros: ${errors.join(', ')}`);
}

// Rota para streaming
app.get('/stream', async (req, res) => {
  const { url, type = 'movie' } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  try {
    console.log('Requisição de streaming:', { url, type });
    
    const streamUrl = processStreamUrl(url, type);
    console.log('URL processada:', streamUrl);

    const customHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'identity',
      'Connection': 'keep-alive',
      'Range': req.headers.range || 'bytes=0-',
      'Referer': 'http://localhost:5173/'
    };

    let response;
    try {
      response = await axios({
        method: 'get',
        url: streamUrl,
        headers: customHeaders,
        responseType: 'stream',
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });
    } catch (error) {
      console.log('Erro no domínio principal, tentando alternativos...');
      response = await tryAlternativeDomains(streamUrl, type, customHeaders);
    }

    // Verificar se a resposta é válida
    if (response.status !== 200 && response.status !== 206) {
      throw new Error(`Servidor retornou status ${response.status}`);
    }

    // Definir headers da resposta
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
    }
    if (response.headers['accept-ranges']) {
      res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
    }

    // Pipe do stream
    response.data.pipe(res);

    // Tratamento de erros durante o streaming
    response.data.on('error', (error) => {
      console.error('Erro durante o streaming:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro durante o streaming' });
      }
      res.end();
    });

  } catch (error) {
    console.error('Erro no streaming:', error);
    res.status(500).json({ 
      error: 'Erro ao processar stream',
      message: error.message,
      details: error.response?.data || error.stack
    });
  }
});

// Rota de teste para verificar se o proxy está funcionando
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy está funcionando' });
});

app.listen(port, () => {
  console.log(`Proxy rodando em http://localhost:${port}`);
});
