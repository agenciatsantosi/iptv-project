// Função para transformar URLs diretas em URLs com proxy
export const getProxiedVideoUrl = (url: string): string => {
  try {
    // Se a URL já for relativa (começando com /), retornar como está
    if (url.startsWith('/')) {
      return url;
    }
    
    // Verificar se a URL é válida
    const originalUrl = new URL(url);
    
    // Lista de domínios que precisam de proxy
    const proxyDomains: Record<string, string> = {
      'cdn.vood.top': '/api/stream',
      'haos.top': '/api/haos',
      'vod.top': '/api/stream',
      'cdn.vod.top': '/api/stream',
      'stream.vod.top': '/api/stream',
      'cdn.stream.vod.top': '/api/stream',
      'cdn.haos.top': '/api/haos',
      'stream.haos.top': '/api/haos',
      'cdn1.haos.top': '/api/haos',
      'cdn2.haos.top': '/api/haos',
      'cdn3.haos.top': '/api/haos',
      'cdn1.vood.top': '/api/stream',
      'cdn2.vood.top': '/api/stream',
      'cdn3.vood.top': '/api/stream'
    };
    
    // Verificar se o domínio está na lista de proxy
    if (proxyDomains[originalUrl.hostname]) {
      return `${proxyDomains[originalUrl.hostname]}${originalUrl.pathname}${originalUrl.search}`;
    }
    
    // Para canais de TV ao vivo, usar o proxy de TV
    if (isLiveStreamUrl(url)) {
      const liveProxyUrl = 'http://localhost:3002';
      // Usar sempre o endpoint /stream para conversão
      return `${liveProxyUrl}/stream?url=${encodeURIComponent(url)}`;
    }
    
    // Para URLs de m3u8 (streaming HLS), adicionar parâmetro especial para dispositivos móveis
    if (url.includes('.m3u8')) {
      // Verificar se já tem parâmetros na URL
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}playsinline=1&autoplay=1`;
    }
    
    // Para URLs de mp4, garantir que funcionem em dispositivos móveis
    if (url.includes('.mp4')) {
      // Verificar se já tem parâmetros na URL
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}playsinline=1`;
    }
    
    // Se não precisar de proxy, retornar a URL original
    return url;
  } catch (error) {
    console.error('Error processing video URL:', error);
    // Em caso de erro, retornar a URL original
    return url;
  }
};

// Função para verificar se é uma URL de stream ao vivo
export const isLiveStreamUrl = (url: string): boolean => {
  // Verificar extensões e padrões comuns de URLs de IPTV
  const livePatterns = [
    // Domínios comuns de IPTV
    'iptv', 'live', 'stream', 'tv',
    // Extensões de streaming
    '.ts', '.m3u8', '.mpd',
    // Protocolos de streaming
    'rtmp://', 'rtsp://', 'udp://'
  ];
  
  // Verificar se a URL contém algum dos padrões
  return livePatterns.some(pattern => url.toLowerCase().includes(pattern));
};
