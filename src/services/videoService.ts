interface VideoResponse {
  url: string;
  headers?: Record<string, string>;
  contentType?: string;
  contentLength?: number;
}

interface StreamInfo {
  streamId: string;
  type: string;
  token?: string;
}

function extractStreamInfo(url: string): StreamInfo | null {
  // Extrai o ID do stream e tipo da URL
  const streamMatch = url.match(/\/(\d+)\.(mp4|m3u8)/);
  if (!streamMatch) return null;

  // Extrai o token se existir
  const tokenMatch = url.match(/[?&]token=([^&]+)/);

  return {
    streamId: streamMatch[1],
    type: streamMatch[2] === 'm3u8' ? 'live' : 'movie',
    token: tokenMatch ? tokenMatch[1] : undefined
  };
}

export async function getVideoUrl(originalUrl: string): Promise<VideoResponse> {
  try {
    const streamInfo = extractStreamInfo(originalUrl);
    if (!streamInfo) {
      console.error('Não foi possível extrair informações do stream');
      return {
        url: originalUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };
    }

    // Constrói a URL do proxy local
    const params = new URLSearchParams({
      username: '670116',
      password: '696009',
      stream: `${streamInfo.streamId}.${streamInfo.type === 'live' ? 'm3u8' : 'mp4'}`,
      type: streamInfo.type
    });

    // Adiciona o token se existir
    if (streamInfo.token) {
      params.append('token', streamInfo.token);
    }

    const proxyUrl = `/api/proxy/stream?${params.toString()}`;
    console.log('URL do proxy:', proxyUrl);

    // Headers para a requisição
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': originalUrl,
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive'
    };

    return { url: proxyUrl, headers };
  } catch (error) {
    console.error('Erro ao processar URL do vídeo:', error);
    return {
      url: originalUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
  }
}

export async function checkVideoUrl(url: string): Promise<VideoResponse> {
  try {
    const streamInfo = extractStreamInfo(url);
    if (!streamInfo) {
      throw new Error('URL inválida');
    }

    const params = new URLSearchParams({
      username: '670116',
      password: '696009',
      stream: `${streamInfo.streamId}.${streamInfo.type === 'live' ? 'm3u8' : 'mp4'}`,
      type: streamInfo.type
    });

    const proxyUrl = `/api/proxy/stream?${params.toString()}`;

    // Faz uma requisição HEAD para verificar se o vídeo está acessível
    const response = await fetch(proxyUrl, {
      method: 'HEAD',
      headers: {
        'Range': 'bytes=0-1'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao acessar vídeo: ${response.status}`);
    }

    // Extrai informações importantes da resposta
    const contentType = response.headers.get('content-type');
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    const acceptRanges = response.headers.get('accept-ranges');

    console.log('Resposta do servidor:', {
      status: response.status,
      contentType,
      contentLength,
      acceptRanges,
      headers: Object.fromEntries(response.headers.entries())
    });

    return {
      url: proxyUrl,
      contentType,
      contentLength,
      headers: {
        'Range': 'bytes=0-'
      }
    };
  } catch (error) {
    console.error('Erro ao verificar URL:', error);
    throw error;
  }
}
