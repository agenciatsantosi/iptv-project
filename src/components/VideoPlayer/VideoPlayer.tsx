import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = true,
  controls = true,
  muted = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [playbackMethod, setPlaybackMethod] = useState<'hls' | 'direct' | null>(null);
  const mountedRef = useRef(true);
  const playbackTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    console.log('[VideoPlayer] Iniciando player com URL:', url);
    setIsLoading(true);
    setError(null);

    // Função para limpar o HLS
    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    // Função para verificar se o vídeo está realmente reproduzindo
    const checkVideoPlayback = () => {
      if (!video.videoWidth || !video.videoHeight) {
        console.log('[VideoPlayer] Stream sem vídeo detectado');
        setError('Não foi possível carregar o vídeo');
      } else {
        console.log('[VideoPlayer] Dimensões do vídeo:', video.videoWidth, 'x', video.videoHeight);
      }
    };

    // Função para tentar recuperar de erros
    const retryLoad = () => {
      if (retryCount < maxRetries) {
        console.log(`[VideoPlayer] Tentativa ${retryCount + 1} de ${maxRetries}`);
        setRetryCount(prev => prev + 1);
        initializePlayer();
      } else {
        console.log('[VideoPlayer] Número máximo de tentativas atingido');
        setError('Não foi possível carregar o vídeo após várias tentativas');
      }
    };

    // Função para iniciar a reprodução com delay
    const startPlayback = () => {
      if (autoPlay && mountedRef.current) {
        if (playbackTimeoutRef.current) {
          clearTimeout(playbackTimeoutRef.current);
        }

        playbackTimeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          
          video.play().catch(err => {
            console.error('[VideoPlayer] Erro ao iniciar reprodução:', err);
            retryLoad();
          });

          // Verifica se o vídeo está realmente reproduzindo após um tempo
          setTimeout(checkVideoPlayback, 5000);
        }, 1000);
      }
    };

    // Inicializa o player direto
    const initializeDirectPlayer = () => {
      console.log('[VideoPlayer] Inicializando player direto');
      destroyHls();
      
      // Força o recarregamento do elemento de vídeo
      video.pause();
      video.removeAttribute('src');
      video.load();
      
      // Define os atributos do vídeo
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';
      video.src = url;
      
      // Força o carregamento
      video.load();
      
      // Inicia a reprodução após um delay
      startPlayback();
    };

    // Inicializa o player
    const initializePlayer = () => {
      initializeDirectPlayer();
    };

    // Event listeners para o vídeo
    const handleLoadStart = () => {
      console.log('[VideoPlayer] Iniciando carregamento');
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log('[VideoPlayer] Vídeo pode ser reproduzido');
      setIsLoading(false);
    };

    const handleLoadedMetadata = () => {
      console.log('[VideoPlayer] Metadados carregados:', {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      });
    };

    const handleTimeUpdate = () => {
      if (video.currentTime > 0) {
        console.log('[VideoPlayer] Tempo atual:', video.currentTime);
      }
    };

    const handleError = (e: Event) => {
      const videoError = (e.target as HTMLVideoElement).error;
      console.error('[VideoPlayer] Erro no vídeo:', videoError);
      
      if (videoError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        console.log('[VideoPlayer] Formato não suportado');
        setError('Formato de vídeo não suportado');
      } else {
        setError(videoError?.message || 'Erro ao carregar vídeo');
        setIsLoading(false);
        retryLoad();
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);

    // Iniciar o player
    initializePlayer();

    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      setRetryCount(0);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      destroyHls();
    };
  }, [url, autoPlay, retryCount]);

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        className="video-player"
        controls={controls}
        muted={muted}
        playsInline
        crossOrigin="anonymous"
      />
      {isLoading && !error && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            Carregando vídeo...
            {retryCount > 0 && ` (Tentativa ${retryCount}/${maxRetries})`}
            {playbackMethod && ` (${playbackMethod === 'hls' ? 'HLS' : 'Direto'})`}
          </div>
        </div>
      )}
      {error && (
        <div className="error-overlay">
          <div className="error-message">{error}</div>
          {retryCount < maxRetries && (
            <button onClick={() => setRetryCount(prev => prev + 1)}>
              Tentar Novamente
            </button>
          )}
        </div>
      )}
    </div>
  );
};