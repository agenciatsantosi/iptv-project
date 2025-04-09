import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': [
              '@chakra-ui/react',
              '@emotion/react',
              '@emotion/styled',
              'framer-motion'
            ],
            'player-vendor': ['plyr', 'hls.js', 'react-player'],
            'utils-vendor': ['axios', 'date-fns', 'zod']
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      middlewareMode: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true
        },
        '/api/stream': {
          target: 'http://cdn.vood.top',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/stream/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/api/haos': {
          target: 'http://haos.top',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/haos/, ''),
        },
      },
      setupMiddleware: (app) => {
        // Configuração CORS
        app.use(cors({
          origin: true,
          credentials: true,
          exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges', 'Content-Type']
        }));

        // Middleware para headers de segurança
        app.use((req, res, next) => {
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
          res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
          next();
        });

        // Rota do proxy para streaming
        app.get('/stream', async (req, res) => {
          const { url } = req.query;

          if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL é obrigatória' });
          }

          try {
            // Extrair informações da URL
            const decodedUrl = decodeURIComponent(url);
            const urlParts = new URL(decodedUrl);
            const pathParts = urlParts.pathname.split('/');
            
            // Construir URL final
            const username = pathParts[2];
            const password = pathParts[3];
            const movieId = pathParts[4].replace('.mp4', '');
            const finalUrl = `http://motoplatxrd.com:80/movie/${username}/${password}/${movieId}.mp4`;

            console.log('Requisitando URL:', finalUrl);

            // Fazer a requisição do vídeo
            const response = await axios({
              method: 'GET',
              url: finalUrl,
              responseType: 'stream',
              timeout: 30000,
              maxRedirects: 5,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Range': req.headers.range || 'bytes=0-',
                'Connection': 'keep-alive'
              }
            });

            // Copiar headers relevantes
            const headers = response.headers;
            
            res.setHeader('Content-Type', headers['content-type'] || 'video/mp4');
            if (headers['content-length']) {
              res.setHeader('Content-Length', headers['content-length']);
            }
            if (headers['content-range']) {
              res.setHeader('Content-Range', headers['content-range']);
            }
            if (headers['accept-ranges']) {
              res.setHeader('Accept-Ranges', headers['accept-ranges']);
            }

            // Headers CORS e segurança
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

            // Status code
            res.status(response.status);

            // Pipe da resposta para o cliente
            response.data.pipe(res);

            // Cleanup
            req.on('close', () => {
              response.data.destroy();
            });

          } catch (error: any) {
            console.error('Erro no proxy:', error.message);
            if (!res.headersSent) {
              res.status(500).json({ 
                error: 'Erro ao processar o vídeo',
                details: error.message
              });
            }
          }
        });

        // Log para confirmar que o proxy está rodando
        console.log('Proxy integrado ao Vite na porta 5173');
      }
    },
    preview: {
      port: 4173,
      host: true
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@chakra-ui/react',
        '@emotion/react',
        '@emotion/styled',
        'framer-motion',
        'plyr',
        'hls.js',
        'react-player',
        'axios',
        'date-fns',
        'zod'
      ]
    }
  };
});