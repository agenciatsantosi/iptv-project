const PROXY_URLS = [
  'https://cors.zimjs.com/',  // CORS Anywhere
  'https://api.allorigins.win/raw?url=', // AllOrigins
];

let currentProxyIndex = 0;

export function getProxiedUrl(url: string): string {
  // Se a URL já for HTTPS, tenta usar diretamente primeiro
  if (url.startsWith('https://')) {
    return url;
  }

  // Para HTTP ou outros protocolos, usa o proxy
  const proxyUrl = PROXY_URLS[currentProxyIndex];
  
  // Rotaciona para o próximo proxy na próxima chamada
  currentProxyIndex = (currentProxyIndex + 1) % PROXY_URLS.length;
  
  return `${proxyUrl}${encodeURIComponent(url)}`;
}
