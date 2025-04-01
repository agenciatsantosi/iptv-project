import express from 'express';
import cors from 'cors';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
const PORT = 3002;

app.use(cors());

app.get('/stream', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send('URL não fornecida');
  }

  try {
    // Configura headers para streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Usa FFmpeg para converter o stream
    const command = ffmpeg(url)
      .inputOptions([
        '-re', // Lê em velocidade nativa
        '-i', url,
        '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ])
      .outputOptions([
        '-c:v', 'libx264', // Codec de vídeo
        '-c:a', 'aac', // Codec de áudio
        '-f', 'mp4', // Formato de saída
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof', // Flags para streaming
        '-preset', 'ultrafast', // Preset mais rápido
        '-tune', 'zerolatency' // Otimizado para streaming
      ])
      .on('error', (err) => {
        console.error('Erro no FFmpeg:', err);
        if (!res.headersSent) {
          res.status(500).send('Erro ao processar stream');
        }
      });

    // Pipe a saída do FFmpeg para a resposta
    command.pipe(res, { end: true });
  } catch (error) {
    console.error('Erro no proxy Live:', error);
    if (!res.headersSent) {
      res.status(500).send('Erro ao processar stream');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy Live rodando na porta ${PORT}`);
});
