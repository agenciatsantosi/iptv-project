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

  useEffect(() => {
    const initializePlayer = async () => {
      if (!videoRef.current || !url) return;

      try {
        setIsLoading(true);
        setError(null);

        // Construir URL do proxy
        const proxyUrl = new URL('/api/stream', window.location.origin);
        proxyUrl.searchParams.set('url', url);
        
        // Fazer a requisição inicial para obter informações do stream
        const response = await fetch(proxyUrl.toString());
        if (!response.ok) {
          throw new Error('Erro ao inicializar stream');
        }

        const data = await response.json();
        const streamUrl = data.url;

        // Limpar instância anterior do HLS se existir
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Verificar se é um stream HLS
        if (streamUrl.includes('.m3u8')) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
              maxBufferSize: 60 * 1000 * 1000, // 60MB
              maxBufferHole: 0.5,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              hls.loadSource(streamUrl);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('Network error:', data);
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error('Media error:', data);
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error('Fatal error:', data);
                    setError('Erro fatal ao carregar vídeo');
                    break;
                }
              }
            });

            hlsRef.current = hls;
          } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Fallback para Safari
            videoRef.current.src = streamUrl;
          }
        } else {
          // Stream direto
          videoRef.current.src = streamUrl;
        }

        // Configurar eventos do vídeo
        videoRef.current.oncanplay = () => {
          setIsLoading(false);
          if (autoPlay) {
            videoRef.current?.play().catch(console.error);
          }
        };

        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            initializePlayer();
          } else {
            setError('Erro ao carregar vídeo após várias tentativas');
          }
        };

      } catch (err) {
        console.error('Error initializing player:', err);
        setError('Erro ao inicializar player');
        setIsLoading(false);
      }
    };

    initializePlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [url, autoPlay, retryCount]);

  return (
    <div className="video-player-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      {error && (
        <div className="error-overlay">
          <div className="error-message">{error}</div>
          <button onClick={() => setRetryCount(0)} className="retry-button">
            Tentar novamente
          </button>
        </div>
      )}
      <video
        ref={videoRef}
        controls={controls}
        muted={muted}
        playsInline
        className="video-player"
      />
    </div>
  );
};