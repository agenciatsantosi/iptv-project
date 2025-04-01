// Função para transformar URLs diretas em URLs com proxy
export const getProxiedVideoUrl = (url: string): string => {
  try {
    const originalUrl = new URL(url);
    
    if (originalUrl.hostname === 'cdn.vood.top') {
      return `/api/stream${originalUrl.pathname}${originalUrl.search}`;
    }
    
    if (originalUrl.hostname === 'haos.top') {
      return `/api/haos${originalUrl.pathname}${originalUrl.search}`;
    }
    
    return url;
  } catch (error) {
    console.error('Error processing video URL:', error);
    return url;
  }
};
