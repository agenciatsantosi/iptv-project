const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Aumentar o limite de tamanho do payload
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Função para seguir redirecionamentos manualmente
async function followRedirects(url, headers, maxRedirects = 5) {
  let currentUrl = url;
  let redirectCount = 0;
  let finalResponse = null;

  while (redirectCount < maxRedirects) {
    try {
      console.log(`Tentando URL: ${currentUrl}`);
      const response = await axios({
        method: 'get',
        url: currentUrl,
        headers: {
          ...headers,
          'host': new URL(currentUrl).host,
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        responseType: 'stream'
      });

      if (response.status === 200) {
        console.log('Sucesso! URL final:', currentUrl);
        finalResponse = response;
        break;
      }

      if (response.headers.location) {
        currentUrl = new URL(response.headers.location, currentUrl).href;
        redirectCount++;
        console.log(`Redirecionando para: ${currentUrl}`);
      } else {
        finalResponse = response;
        break;
      }
    } catch (error) {
      if (error.response?.headers?.location) {
        currentUrl = new URL(error.response.headers.location, currentUrl).href;
        redirectCount++;
        console.log(`Redirecionando após erro para: ${currentUrl}`);
      } else {
        throw error;
      }
    }
  }

  if (!finalResponse) {
    throw new Error('Máximo de redirecionamentos excedido');
  }

  return { response: finalResponse, finalUrl: currentUrl };
}

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    console.log('URL inicial:', url);
    
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Range': req.headers.range,
      ...req.headers,
      'host': new URL(url).host,
      'origin': new URL(url).origin,
      'referer': new URL(url).origin
    };

    // Seguir redirecionamentos mantendo os headers
    const { response, finalUrl } = await followRedirects(url, requestHeaders);
    console.log('URL final após redirecionamentos:', finalUrl);

    // Copiar headers relevantes da resposta
    const headers = {
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.headers['content-length'],
      'Accept-Ranges': 'bytes',
      'Content-Range': response.headers['content-range'],
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    };

    // Se for uma lista M3U, processar como texto
    if (response.headers['content-type']?.includes('text/plain') || 
        response.headers['content-type']?.includes('application/x-mpegurl')) {
      const chunks = [];
      for await (const chunk of response.data) {
        chunks.push(chunk);
      }
      const content = Buffer.concat(chunks).toString('utf-8');
      res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      });
      return res.send(content);
    }

    // Para outros tipos de conteúdo (vídeo, áudio, etc), fazer streaming
    res.writeHead(response.status, headers);
    response.data.pipe(res);

  } catch (error) {
    console.error('Proxy error:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Error fetching content: ' + error.message);
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
