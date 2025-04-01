import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3003;

// Configuração CORS mais permissiva
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  try {
    console.log('Tentando baixar playlist:', url);

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'text',
      maxRedirects: 5,
      timeout: 30000,
      validateStatus: (status) => status < 400,
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    });

    // Verifica se é uma playlist M3U válida
    const content = response.data;
    if (!content || typeof content !== 'string') {
      console.error('Resposta inválida:', typeof content);
      return res.status(400).json({ 
        error: 'Resposta inválida do servidor'
      });
    }

    if (!content.trim().startsWith('#EXTM3U')) {
      console.error('Conteúdo não é uma playlist M3U válida');
      return res.status(400).json({ 
        error: 'Arquivo inválido: Não é uma lista M3U/M3U8 válida'
      });
    }

    console.log('Playlist baixada com sucesso, tamanho:', content.length);

    // Retorna a playlist
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);

  } catch (error) {
    console.error('Erro ao baixar playlist:', error.message);
    
    let errorMessage = 'Erro ao baixar a playlist';
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      switch (error.response.status) {
        case 404:
          errorMessage = 'Playlist não encontrada';
          break;
        case 403:
          errorMessage = 'Acesso negado à playlist';
          break;
        case 401:
          errorMessage = 'Autenticação necessária para acessar a playlist';
          break;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tempo limite excedido ao tentar baixar a playlist';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Servidor não encontrado';
      statusCode = 404;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy de playlist rodando na porta ${PORT}`);
});
