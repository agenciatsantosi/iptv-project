export function useVideoUrl() {
  const getVideoUrl = (url: string) => {
    try {
      // Remove aspas simples e outros caracteres problemáticos
      const cleanUrl = url.replace(/['"`]/g, '');

      // Se a URL já é do motoplatxrd, precisamos verificar para onde ela redireciona
      if (cleanUrl.includes('motoplatxrd.com')) {
        // Extrair o ID do vídeo
        const match = cleanUrl.match(/\/(\d+)\.mp4/);
        if (!match) return cleanUrl;

        const videoId = match[1];
        
        // Usar a porta 3000 para o proxy
        return `http://localhost:3000/stream?url=${encodeURIComponent(cleanUrl)}`;
      }

      // Se a URL já é de algum dos domínios finais, usar o proxy apropriado
      if (cleanUrl.includes('fontedecanais-app')) {
        return `http://localhost:3000/stream?url=${encodeURIComponent(cleanUrl)}`;
      }

      if (cleanUrl.includes('onefr.xplatrd.com')) {
        return `http://localhost:3000/stream?url=${encodeURIComponent(cleanUrl)}`;
      }

      // Para qualquer outra URL, usar o proxy também
      return `http://localhost:3000/stream?url=${encodeURIComponent(cleanUrl)}`;
    } catch (error) {
      console.error('Error processing video URL:', error);
      return url;
    }
  };

  return { getVideoUrl };
}
