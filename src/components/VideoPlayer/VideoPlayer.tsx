import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './VideoPlayer.css';

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  autoplay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  poster,
  autoplay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const initPlayer = async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Limpar instância anterior do player se existir
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      // Configurar novo player
      playerRef.current = new Plyr(videoRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'settings',
          'fullscreen'
        ],
        settings: ['quality', 'speed'],
        quality: {
          default: 720,
          options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        }
      });

      // Verificar se é uma stream HLS
      if (url.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxBufferHole: 0.5,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(url);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error:', data);
                  if (retryCount < maxRetries) {
                    setRetryCount(prev => prev + 1);
                    hls.startLoad();
                  } else {
                    setError('Erro de conexão. Por favor, verifique sua internet.');
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error:', data);
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Erro ao carregar o vídeo. Por favor, tente novamente.');
                  break;
              }
            }
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (autoplay) {
              videoRef.current?.play().catch(e => console.error('Autoplay failed:', e));
            }
          });
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Fallback para Safari
          videoRef.current.src = url;
          setIsLoading(false);
        }
      } else {
        // Vídeo não-HLS
        videoRef.current.src = url;
        setIsLoading(false);
      }

    } catch (err) {
      console.error('Player initialization error:', err);
      setError('Erro ao inicializar o player. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initPlayer();
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [url]);

  const handleRetry = () => {
    setRetryCount(0);
    initPlayer();
  };

  return (
    <div className="video-player-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Carregando...</div>
        </div>
      )}
      
      {error && (
        <div className="error-overlay">
          <div className="error-message">{error}</div>
          <button className="retry-button" onClick={handleRetry}>
            Tentar Novamente
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        className="video-player"
        poster={poster}
        playsInline
        controls
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Video error:', e);
          setError('Erro ao reproduzir o vídeo. Por favor, tente novamente.');
          setIsLoading(false);
        }}
        onPlaying={() => setIsLoading(false)}
      >
        <source src={url} type={url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} />
        Seu navegador não suporta o elemento de vídeo.
      </video>
    </div>
  );
};