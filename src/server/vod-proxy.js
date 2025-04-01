import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Configuração CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Range', 'User-Agent', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges']
}));

app.get('/stream', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }

    console.log('Recebida requisição para:', {
      url,
      headers: req.headers
    });

    // Configura headers para streaming
    const headers = {
      'User-Agent': req.headers['user-agent'],
      'Range': req.headers.range,
      'Accept': '*/*',
      'Referer': 'http://haos.top/',
      'Origin': 'http://haos.top'
    };

    // Remove headers undefined
    Object.keys(headers).forEach(key => {
      if (!headers[key]) delete headers[key];
    });

    console.log('Headers da requisição:', headers);

    // Faz a requisição para o servidor de vídeo
    const response = await axios({
      method: 'get',
      url: url,
      headers: headers,
      responseType: 'stream',
      maxRedirects: 5,
      timeout: 30000,
      validateStatus: status => status >= 200 && status < 400
    });

    console.log('Headers da resposta:', response.headers);

    // Define os headers da resposta
    Object.entries(response.headers).forEach(([key, value]) => {
      // Não copia headers problemáticos
      if (!['connection', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Garante que os headers essenciais estão presentes
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');

    // Define o status baseado no range
    const status = req.headers.range ? 206 : 200;
    res.status(status);

    // Pipe o stream de vídeo para a resposta
    response.data.pipe(res);

    // Tratamento de erros no stream
    response.data.on('error', (error) => {
      console.error('Erro no stream:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao processar o stream de vídeo' });
      } else {
        res.end();
      }
    });

    // Cleanup quando a conexão for fechada
    req.on('close', () => {
      response.data.destroy();
    });

  } catch (error) {
    console.error('Erro no proxy:', error);
    
    if (error.response) {
      console.error('Detalhes do erro:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers
      });
      return res.status(error.response.status).json({
        error: `Erro na requisição: ${error.response.status} ${error.response.statusText}`
      });
    } else if (error.request) {
      console.error('Erro na requisição (sem resposta):', error.message);
      return res.status(502).json({
        error: 'Erro ao conectar com o servidor de vídeo'
      });
    } else {
      console.error('Erro geral:', error.message);
      return res.status(500).json({
        error: 'Erro interno no servidor proxy'
      });
    }
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Servidor VOD proxy rodando na porta ${port}`);
});
