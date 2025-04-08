import React, { useEffect, useRef, useState } from 'react';

interface VODPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  onError?: (error: any) => void;
}

const VODPlayer: React.FC<VODPlayerProps> = ({
  url,
  title,
  poster,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Extrai a URL direta do proxy se necessário
  const getDirectUrl = (url: string) => {
    if (url.includes('/stream?url=')) {
      // Extrair URL original do parâmetro de consulta
      const match = url.match(/\/stream\?url=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    return url;
  };

  // Função para carregar o vídeo MP4 diretamente
  const loadVideo = (videoUrl: string) => {
    if (!videoRef.current) return;
    
    // Resetar player
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Obter URL direta sem proxy
      const directUrl = getDirectUrl(videoUrl);
      console.log('[VOD Player] Carregando URL direta:', directUrl);
      
      const video = videoRef.current;
      video.src = directUrl;
      
      // Eventos de vídeo
      video.addEventListener('loadeddata', () => {
        console.log('[VOD Player] Vídeo carregado');
        setLoading(false);
      });
      
      video.addEventListener('playing', () => {
        console.log('[VOD Player] Vídeo em reprodução');
        setLoading(false);
      });
      
      video.addEventListener('error', (e) => {
        console.error('[VOD Player] Erro de vídeo:', video.error);
        setError('Erro ao carregar vídeo. Verifique se a URL está correta.');
        onError?.(video.error);
        setLoading(false);
      });
      
      // Tentar iniciar reprodução
      video.load();
      video.play().catch(err => {
        console.warn('[VOD Player] Erro ao iniciar reprodução:', err);
      });
    } catch (error: any) {
      console.error('[VOD Player] Erro:', error);
      setError(error.message || 'Erro desconhecido');
      setLoading(false);
      onError?.(error);
    }
  };

  // Carregar vídeo quando a URL mudar
  useEffect(() => {
    console.log('[VOD Player] Inicializando com URL:', url);
    
    if (!url) {
      setError('URL não fornecida');
      setLoading(false);
      return;
    }
    
    loadVideo(url);
    
    // Cleanup
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
      }
    };
  }, [url]);

  return (
    <div className="vod-player relative w-full h-full bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10 p-4">
          <p className="text-xl font-bold mb-2">Erro ao reproduzir o vídeo</p>
          <p className="text-sm mb-4 max-w-md text-center">{error}</p>
          <button 
            onClick={() => loadVideo(url)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        poster={poster}
        title={title}
        playsInline
      />
    </div>
  );
};

export default VODPlayer; 