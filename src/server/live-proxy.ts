import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { URL } from 'url';

const app = express();
const PORT = process.env.LIVE_PROXY_PORT || 3002;

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range']
}));

// Middleware para adicionar headers de segurança
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Função para extrair credenciais da URL
function extractCredentials(url: string): { username?: string; password?: string; cleanUrl: string } {
  try {
    const parsedUrl = new URL(url);
    const username = parsedUrl.username;
    const password = parsedUrl.password;
    
    // Limpar as credenciais da URL
    parsedUrl.username = '';
    parsedUrl.password = '';
    
    return {
      username: username || undefined,
      password: password || undefined,
      cleanUrl: parsedUrl.toString()
    };
  } catch (error) {
    console.error('Erro ao extrair credenciais da URL:', error);
    return { cleanUrl: url };
  }
}

// Função para determinar o tipo de conteúdo com base na URL
function getContentType(url: string, responseHeaders: any = {}): string {
  if (responseHeaders['content-type']) {
    return responseHeaders['content-type'];
  }
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.endsWith('.m3u8')) {
    return 'application/vnd.apple.mpegurl';
  } else if (lowerUrl.endsWith('.ts')) {
    return 'video/mp2t';
  } else if (lowerUrl.endsWith('.mp4')) {
    return 'video/mp4';
  } else if (lowerUrl.endsWith('.webm')) {
    return 'video/webm';
  } else if (lowerUrl.endsWith('.mpd')) {
    return 'application/dash+xml';
  } else if (lowerUrl.includes('m3u8')) {
    return 'application/vnd.apple.mpegurl';
  }
  
  // Padrão para streaming
  return 'video/mp4';
}

// Função para tratar URLs problemáticas conhecidas
function handleProblematicUrl(url: string): string {
  // Adicione aqui tratamentos específicos para URLs conhecidas que causam problemas
  
  // Exemplo: Substituir domínios específicos ou padrões de URL
  if (url.includes('example-problematic-domain.com')) {
    return url.replace('example-problematic-domain.com', 'alternative-domain.com');
  }
  
  return url;
}

// Rota para streaming de conteúdo - Sem conversão, apenas proxy direto
app.get('/stream', async (req, res) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).send('URL é obrigatória');
  }
  
  try {
    console.log(`[Live Proxy] Iniciando stream para: ${url}`);
    const modifiedUrl = handleProblematicUrl(url);
    const { username, password, cleanUrl } = extractCredentials(modifiedUrl);
    
    // Configurar headers para a requisição
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Origin': 'https://example.com',
      'Referer': 'https://example.com/'
    };
    
    // Se houver Range header, adiciona ao request
    if (req.headers.range) {
      headers['Range'] = req.headers.range as string;
      console.log('[Live Proxy] Usando range:', req.headers.range);
    }
    
    // Adicionar autenticação básica se houver credenciais
    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    // Fazer a requisição para o URL original
    const response = await axios({
      method: 'get',
      url: cleanUrl,
      headers,
      responseType: 'stream',
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    // Determinar o tipo de conteúdo
    const contentType = getContentType(cleanUrl, response.headers);
    
    // Configurar headers da resposta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Se tiver content-length, adiciona
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    
    // Se for uma requisição com Range
    if (req.headers.range && response.headers['content-range']) {
      res.status(206);
      res.setHeader('Content-Range', response.headers['content-range']);
    } else {
      res.status(200);
    }
    
    // Transmitir o conteúdo diretamente sem processamento
    response.data.pipe(res);
    
    // Monitorar eventos do stream
    response.data.on('data', (chunk: Buffer) => {
      console.log(`[Live Proxy] Recebendo dados: ${chunk.length} bytes`);
    });
    
    // Cleanup quando a conexão for fechada
    req.on('close', () => {
      console.log('[Live Proxy] Conexão fechada pelo cliente');
      response.data.destroy();
    });
    
  } catch (error: any) {
    console.error('Erro ao processar stream:', error.message);
    
    if (error.response) {
      res.status(error.response.status).send(`Erro no servidor de origem: ${error.response.status}`);
    } else if (error.request) {
      res.status(500).send('Não foi possível conectar ao servidor de origem');
    } else {
      res.status(500).send('Erro ao processar a requisição');
    }
  }
});

// Rota para acesso direto ao conteúdo
app.get('/direct', async (req, res) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).send('URL é obrigatória');
  }
  
  try {
    console.log(`[Live Proxy] Redirecionamento direto para: ${url}`);
    const modifiedUrl = handleProblematicUrl(url);
    const { username, password, cleanUrl } = extractCredentials(modifiedUrl);
    
    // Configurar headers para a requisição
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Origin': 'https://example.com',
      'Referer': 'https://example.com/'
    };
    
    // Adicionar autenticação básica se houver credenciais
    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    try {
      // Obter a URL final após redirecionamentos
      await axios({
        method: 'head',
        url: cleanUrl,
        headers,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });
      
      console.log(`[Live Proxy] Redirecionando para URL final: ${cleanUrl}`);
      
      // Adicionar headers CORS e segurança
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      // Redirecionar para a URL final
      return res.redirect(cleanUrl);
      
    } catch (headError: any) {
      console.warn('[Live Proxy] HEAD request falhou:', headError.message);
      // Se o HEAD falhar, tenta redirecionar diretamente para a URL original
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.redirect(cleanUrl);
    }
    
  } catch (error: any) {
    console.error('Erro ao processar acesso direto:', error.message);
    
    if (!res.headersSent) {
      res.status(500).send('Erro ao processar redirecionamento');
    }
  }
});

// Endpoint para gerar URL alternativa para canais sem URL
app.get('/generate-url', async (req, res) => {
  const { id, name } = req.query;
  
  if (!id || !name) {
    return res.status(400).json({ error: 'ID e nome do canal são obrigatórios' });
  }
  
  try {
    console.log(`[Live Proxy] Gerando URL alternativa para canal: ${name} (${id})`);
    
    // Extrair número do canal, se existir
    const channelNumber = String(name).match(/^\d+/);
    let generatedUrl = null;
    
    // Lista de servidores alternativos para tentar
    const alternativeServers = [
      `http://vyvofibra.us:80/vrp9j4/8seq1h/`,
      `http://cdn.canais.cc/hls/`,
      `http://cdn.canais.live/hls/`,
      `http://cdn.canais.vip/hls/`
    ];
    
    // Tentar gerar URL baseada no número do canal
    if (channelNumber) {
      const channelNum = channelNumber[0];
      console.log(`[Live Proxy] Canal possui número: ${channelNum}`);
      
      // Tentar primeiro servidor com o número do canal
      generatedUrl = `${alternativeServers[0]}${channelNum}`;
    } else {
      // Se não tiver número, tentar usar o nome do canal
      const cleanName = String(name)
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^\w\s]/gi, '')
        .replace(/adultos|xxx|adulto|porn|(\d+\s*hs)/gi, '');
      
      if (cleanName.length > 2) {
        console.log(`[Live Proxy] Usando nome limpo do canal: ${cleanName}`);
        generatedUrl = `${alternativeServers[1]}${cleanName}.m3u8`;
      }
    }
    
    if (!generatedUrl) {
      return res.status(404).json({ error: 'Não foi possível gerar URL alternativa' });
    }
    
    console.log(`[Live Proxy] URL alternativa gerada: ${generatedUrl}`);
    
    // Verificar se a URL gerada é válida
    try {
      await axios({
        method: 'HEAD',
        url: generatedUrl,
        timeout: 5000,
        validateStatus: (status) => status < 400
      });
      
      console.log(`[Live Proxy] URL alternativa validada com sucesso: ${generatedUrl}`);
      return res.json({ url: generatedUrl });
    } catch (checkError) {
      console.log(`[Live Proxy] Primeira URL alternativa falhou, tentando outros servidores...`);
      
      // Tentar outros servidores
      for (let i = 1; i < alternativeServers.length; i++) {
        if (channelNumber) {
          const altUrl = `${alternativeServers[i]}${channelNumber[0]}.m3u8`;
          
          try {
            console.log(`[Live Proxy] Tentando servidor alternativo ${i+1}: ${altUrl}`);
            await axios({
              method: 'HEAD',
              url: altUrl,
              timeout: 3000,
              validateStatus: (status) => status < 400
            });
            
            console.log(`[Live Proxy] URL alternativa ${i+1} validada com sucesso: ${altUrl}`);
            return res.json({ url: altUrl });
          } catch (e) {
            console.log(`[Live Proxy] Servidor alternativo ${i+1} falhou`);
          }
        }
      }
      
      // Se chegou aqui, nenhuma URL alternativa funcionou
      console.log(`[Live Proxy] Retornando URL não validada como último recurso`);
      return res.json({ url: generatedUrl, validated: false });
    }
  } catch (error) {
    console.error('[Live Proxy] Erro ao gerar URL alternativa:', error);
    res.status(500).json({ error: 'Erro ao gerar URL alternativa' });
  }
});

// Iniciar o servidor
const liveProxy = app.listen(PORT, () => {
  console.log(`[Live Proxy] Servidor rodando na porta ${PORT}`);
});

// Tratamento de erros do servidor
liveProxy.on('error', (error) => {
  console.error('Erro no servidor Live:', error);
});

export default app;
