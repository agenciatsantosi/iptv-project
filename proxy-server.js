import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3001;

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'HEAD', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Range', 'User-Agent', 'X-Requested-With']
}));

// Configuração do proxy
const proxyConfig = {
  target: 'http://motoplatxrd.com',
  changeOrigin: true,
  followRedirects: true,
  secure: false,
  ws: true, // Habilita WebSocket
  xfwd: true, // Encaminha headers originais
  timeout: 60000, // Aumenta o timeout para 60s
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    // Adiciona headers importantes para streaming
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
    if (req.headers.range) {
      proxyReq.setHeader('Range', req.headers.range);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Adiciona headers CORS na resposta
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Range, User-Agent, X-Requested-With';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Range, Content-Length, Content-Type, Accept-Ranges';

    // Remove headers que podem causar problemas
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];

    // Preserva headers importantes para streaming
    const headersToPreserve = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'expires',
      'date',
      'etag',
      'last-modified'
    ];

    headersToPreserve.forEach(header => {
      if (proxyRes.headers[header]) {
        res.setHeader(header, proxyRes.headers[header]);
      }
    });

    // Log para debug
    console.log('Proxy Response:', {
      url: req.url,
      status: proxyRes.statusCode,
      contentType: proxyRes.headers['content-type'],
      contentLength: proxyRes.headers['content-length']
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', {
      url: req.url,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Proxy Error', 
      message: err.message,
      url: req.url 
    });
  }
};

// Middleware para lidar com preflight requests
app.options('*', cors());

// Rota principal do proxy
app.use('/', createProxyMiddleware({
  ...proxyConfig,
  pathRewrite: {
    '^/proxy/': '/'
  }
}));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
