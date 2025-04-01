import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3003;

app.use(cors());

app.get('/fetch', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*'
      },
      timeout: 30000 // 30 segundos
    });

    // Verifica se é uma playlist M3U válida
    const content = response.data;
    if (!content.trim().startsWith('#EXTM3U')) {
      return res.status(400).json({ 
        error: 'Arquivo inválido: Não é uma lista M3U/M3U8 válida'
      });
    }

    // Retorna a playlist
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (error: any) {
    console.error('Erro ao baixar playlist:', error);
    
    const errorMessage = error.response?.status === 404
      ? 'Playlist não encontrada'
      : error.code === 'ECONNABORTED'
      ? 'Tempo limite excedido ao tentar baixar a playlist'
      : 'Erro ao baixar a playlist';

    res.status(500).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy de playlist rodando na porta ${PORT}`);
});
