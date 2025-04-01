// vite.config.ts
import { defineConfig } from "file:///c:/Users/a0001/Desktop/projetos/iptv/v2/01/project/node_modules/vite/dist/node/index.js";
import react from "file:///c:/Users/a0001/Desktop/projetos/iptv/v2/01/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import cors from "file:///c:/Users/a0001/Desktop/projetos/iptv/v2/01/project/node_modules/cors/lib/index.js";
import axios from "file:///c:/Users/a0001/Desktop/projetos/iptv/v2/01/project/node_modules/axios/index.js";
var __vite_injected_original_dirname = "c:\\Users\\a0001\\Desktop\\projetos\\iptv\\v2\\01\\project";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    middlewareMode: false,
    proxy: {
      "/api/stream": {
        target: "http://cdn.vood.top",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/stream/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        }
      },
      "/api/haos": {
        target: "http://haos.top",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/haos/, "")
      }
    },
    setupMiddleware: (app) => {
      app.use(cors({
        origin: true,
        credentials: true,
        exposedHeaders: ["Content-Length", "Content-Range", "Accept-Ranges", "Content-Type"]
      }));
      app.use((req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
        res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
        next();
      });
      app.get("/stream", async (req, res) => {
        const { url } = req.query;
        if (!url || typeof url !== "string") {
          return res.status(400).json({ error: "URL \xE9 obrigat\xF3ria" });
        }
        try {
          const decodedUrl = decodeURIComponent(url);
          const urlParts = new URL(decodedUrl);
          const pathParts = urlParts.pathname.split("/");
          const username = pathParts[2];
          const password = pathParts[3];
          const movieId = pathParts[4].replace(".mp4", "");
          const finalUrl = `http://motoplatxrd.com:80/movie/${username}/${password}/${movieId}.mp4`;
          console.log("Requisitando URL:", finalUrl);
          const response = await axios({
            method: "GET",
            url: finalUrl,
            responseType: "stream",
            timeout: 3e4,
            maxRedirects: 5,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "Accept": "*/*",
              "Accept-Encoding": "gzip, deflate, br",
              "Range": req.headers.range || "bytes=0-",
              "Connection": "keep-alive"
            }
          });
          const headers = response.headers;
          res.setHeader("Content-Type", headers["content-type"] || "video/mp4");
          if (headers["content-length"]) {
            res.setHeader("Content-Length", headers["content-length"]);
          }
          if (headers["content-range"]) {
            res.setHeader("Content-Range", headers["content-range"]);
          }
          if (headers["accept-ranges"]) {
            res.setHeader("Accept-Ranges", headers["accept-ranges"]);
          }
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
          res.status(response.status);
          response.data.pipe(res);
          req.on("close", () => {
            response.data.destroy();
          });
        } catch (error) {
          console.error("Erro no proxy:", error.message);
          if (!res.headersSent) {
            res.status(500).json({
              error: "Erro ao processar o v\xEDdeo",
              details: error.message
            });
          }
        }
      });
      console.log("Proxy integrado ao Vite na porta 5173");
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJjOlxcXFxVc2Vyc1xcXFxhMDAwMVxcXFxEZXNrdG9wXFxcXHByb2pldG9zXFxcXGlwdHZcXFxcdjJcXFxcMDFcXFxccHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiYzpcXFxcVXNlcnNcXFxcYTAwMDFcXFxcRGVza3RvcFxcXFxwcm9qZXRvc1xcXFxpcHR2XFxcXHYyXFxcXDAxXFxcXHByb2plY3RcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2M6L1VzZXJzL2EwMDAxL0Rlc2t0b3AvcHJvamV0b3MvaXB0di92Mi8wMS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBjb3JzIGZyb20gJ2NvcnMnO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJylcbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZSxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIG1pZGRsZXdhcmVNb2RlOiBmYWxzZSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGkvc3RyZWFtJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vY2RuLnZvb2QudG9wJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvc3RyZWFtLywgJycpLFxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBSZXF1ZXN0IHRvIHRoZSBUYXJnZXQ6JywgcmVxLm1ldGhvZCwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBSZXNwb25zZSBmcm9tIHRoZSBUYXJnZXQ6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgJy9hcGkvaGFvcyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2hhb3MudG9wJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvaGFvcy8sICcnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzZXR1cE1pZGRsZXdhcmU6IChhcHApID0+IHtcbiAgICAgIC8vIENvbmZpZ3VyYVx1MDBFN1x1MDBFM28gQ09SU1xuICAgICAgYXBwLnVzZShjb3JzKHtcbiAgICAgICAgb3JpZ2luOiB0cnVlLFxuICAgICAgICBjcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgICAgZXhwb3NlZEhlYWRlcnM6IFsnQ29udGVudC1MZW5ndGgnLCAnQ29udGVudC1SYW5nZScsICdBY2NlcHQtUmFuZ2VzJywgJ0NvbnRlbnQtVHlwZSddXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIE1pZGRsZXdhcmUgcGFyYSBoZWFkZXJzIGRlIHNlZ3VyYW5cdTAwRTdhXG4gICAgICBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdDcm9zcy1PcmlnaW4tUmVzb3VyY2UtUG9saWN5JywgJ2Nyb3NzLW9yaWdpbicpO1xuICAgICAgICByZXMuc2V0SGVhZGVyKCdDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5JywgJ3Vuc2FmZS1ub25lJyk7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0Nyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5JywgJ3Vuc2FmZS1ub25lJyk7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBSb3RhIGRvIHByb3h5IHBhcmEgc3RyZWFtaW5nXG4gICAgICBhcHAuZ2V0KCcvc3RyZWFtJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdXJsIH0gPSByZXEucXVlcnk7XG5cbiAgICAgICAgaWYgKCF1cmwgfHwgdHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oeyBlcnJvcjogJ1VSTCBcdTAwRTkgb2JyaWdhdFx1MDBGM3JpYScgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIEV4dHJhaXIgaW5mb3JtYVx1MDBFN1x1MDBGNWVzIGRhIFVSTFxuICAgICAgICAgIGNvbnN0IGRlY29kZWRVcmwgPSBkZWNvZGVVUklDb21wb25lbnQodXJsKTtcbiAgICAgICAgICBjb25zdCB1cmxQYXJ0cyA9IG5ldyBVUkwoZGVjb2RlZFVybCk7XG4gICAgICAgICAgY29uc3QgcGF0aFBhcnRzID0gdXJsUGFydHMucGF0aG5hbWUuc3BsaXQoJy8nKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBDb25zdHJ1aXIgVVJMIGZpbmFsXG4gICAgICAgICAgY29uc3QgdXNlcm5hbWUgPSBwYXRoUGFydHNbMl07XG4gICAgICAgICAgY29uc3QgcGFzc3dvcmQgPSBwYXRoUGFydHNbM107XG4gICAgICAgICAgY29uc3QgbW92aWVJZCA9IHBhdGhQYXJ0c1s0XS5yZXBsYWNlKCcubXA0JywgJycpO1xuICAgICAgICAgIGNvbnN0IGZpbmFsVXJsID0gYGh0dHA6Ly9tb3RvcGxhdHhyZC5jb206ODAvbW92aWUvJHt1c2VybmFtZX0vJHtwYXNzd29yZH0vJHttb3ZpZUlkfS5tcDRgO1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJ1JlcXVpc2l0YW5kbyBVUkw6JywgZmluYWxVcmwpO1xuXG4gICAgICAgICAgLy8gRmF6ZXIgYSByZXF1aXNpXHUwMEU3XHUwMEUzbyBkbyB2XHUwMEVEZGVvXG4gICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcyh7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgdXJsOiBmaW5hbFVybCxcbiAgICAgICAgICAgIHJlc3BvbnNlVHlwZTogJ3N0cmVhbScsXG4gICAgICAgICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICAgICAgICAgIG1heFJlZGlyZWN0czogNSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ1VzZXItQWdlbnQnOiAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkxLjAuNDQ3Mi4xMjQgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICAgICAgICdBY2NlcHQnOiAnKi8qJyxcbiAgICAgICAgICAgICAgJ0FjY2VwdC1FbmNvZGluZyc6ICdnemlwLCBkZWZsYXRlLCBicicsXG4gICAgICAgICAgICAgICdSYW5nZSc6IHJlcS5oZWFkZXJzLnJhbmdlIHx8ICdieXRlcz0wLScsXG4gICAgICAgICAgICAgICdDb25uZWN0aW9uJzogJ2tlZXAtYWxpdmUnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBDb3BpYXIgaGVhZGVycyByZWxldmFudGVzXG4gICAgICAgICAgY29uc3QgaGVhZGVycyA9IHJlc3BvbnNlLmhlYWRlcnM7XG4gICAgICAgICAgXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgaGVhZGVyc1snY29udGVudC10eXBlJ10gfHwgJ3ZpZGVvL21wNCcpO1xuICAgICAgICAgIGlmIChoZWFkZXJzWydjb250ZW50LWxlbmd0aCddKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LUxlbmd0aCcsIGhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGVhZGVyc1snY29udGVudC1yYW5nZSddKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVJhbmdlJywgaGVhZGVyc1snY29udGVudC1yYW5nZSddKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhlYWRlcnNbJ2FjY2VwdC1yYW5nZXMnXSkge1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXB0LVJhbmdlcycsIGhlYWRlcnNbJ2FjY2VwdC1yYW5nZXMnXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSGVhZGVycyBDT1JTIGUgc2VndXJhblx1MDBFN2FcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0Nyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3knLCAnY3Jvc3Mtb3JpZ2luJyk7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeScsICd1bnNhZmUtbm9uZScpO1xuXG4gICAgICAgICAgLy8gU3RhdHVzIGNvZGVcbiAgICAgICAgICByZXMuc3RhdHVzKHJlc3BvbnNlLnN0YXR1cyk7XG5cbiAgICAgICAgICAvLyBQaXBlIGRhIHJlc3Bvc3RhIHBhcmEgbyBjbGllbnRlXG4gICAgICAgICAgcmVzcG9uc2UuZGF0YS5waXBlKHJlcyk7XG5cbiAgICAgICAgICAvLyBDbGVhbnVwXG4gICAgICAgICAgcmVxLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEuZGVzdHJveSgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvIG5vIHByb3h5OicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgIGlmICghcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IFxuICAgICAgICAgICAgICBlcnJvcjogJ0Vycm8gYW8gcHJvY2Vzc2FyIG8gdlx1MDBFRGRlbycsXG4gICAgICAgICAgICAgIGRldGFpbHM6IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIExvZyBwYXJhIGNvbmZpcm1hciBxdWUgbyBwcm94eSBlc3RcdTAwRTEgcm9kYW5kb1xuICAgICAgY29uc29sZS5sb2coJ1Byb3h5IGludGVncmFkbyBhbyBWaXRlIG5hIHBvcnRhIDUxNzMnKTtcbiAgICB9XG4gIH1cbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFYsU0FBUyxvQkFBb0I7QUFDdlgsT0FBTyxXQUFXO0FBQ2xCLE9B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
