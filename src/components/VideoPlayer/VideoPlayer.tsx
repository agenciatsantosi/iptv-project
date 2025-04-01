import React, { useRef, useEffect, useState } from 'react';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';
import './player.css';

interface VideoPlayerProps {
  id: string;
  url: string;
  title?: string;
  type?: string;
  episodeId?: string;
  seasonNumber?: number;
  autoPlay?: boolean;
  onError?: (error: any) => void;
}

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

export function VideoPlayer({ 
  id, 
  url, 
  title, 
  type,
  episodeId,
  seasonNumber,
  autoPlay = false,
  onError 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr>();
  const hlsRef = useRef<Hls | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const [isInitialized, setIsInitialized] = useState(false);

  const destroyPlayer = () => {
    try {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = undefined;
      }
      if (videoRef.current) {
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
      setIsInitialized(false);
      setRetryCount(0);
    } catch (error) {
      console.error('Error destroying player:', error);
    }
  };

  const initializePlayer = () => {
    if (!videoRef.current || isInitialized) return;

    const video = videoRef.current;

    try {
      // Configuração do player
      const player = new Plyr(video, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        settings: ['captions', 'quality', 'speed', 'loop'],
        quality: {
          default: 720,
          options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        },
        tooltips: { controls: true, seek: true },
        keyboard: { focused: true, global: true },
        seekTime: 10,
        volume: 1,
        muted: false,
        clickToPlay: true,
        disableContextMenu: false,
        ratio: '16:9',
        resetOnEnd: false,
        debug: true,
        displayDuration: true,
        invertTime: false,
        toggleInvert: false,
        autoplay: autoPlay,
        autopause: false,
        playsinline: true,
        fullscreen: {
          enabled: true,
          fallback: true,
          iosNative: true
        },
        previewThumbnails: false,
        storage: { enabled: true, key: 'plyr' }
      });

      playerRef.current = player;
      setIsInitialized(true);

      // Constrói a URL do proxy
      const proxyUrl = `${PROXY_URL}/stream?url=${encodeURIComponent(url)}`;
      console.log('URL do vídeo:', { original: url, proxy: proxyUrl });

      // Limpa os event listeners anteriores
      const cleanupListeners = () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('playing', handlePlaying);
      };

      // Event handlers
      const handleError = async (e: any) => {
        const videoError = video.error;
        console.error('Video Error:', {
          error: e,
          code: videoError?.code,
          message: videoError?.message
        });

        if (retryCount < MAX_RETRIES) {
          console.log(`Tentativa ${retryCount + 1} de ${MAX_RETRIES}`);
          setRetryCount(prev => prev + 1);
          
          // Espera um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          
          try {
            // Tenta diferentes abordagens de carregamento
            if (hlsRef.current) {
              hlsRef.current.destroy();
              hlsRef.current = null;
            }
            
            // Tenta carregar diretamente
            video.src = proxyUrl;
            video.load();
            
            if (autoPlay) {
              await video.play();
            }
          } catch (playError) {
            console.error('Erro ao tentar novamente:', playError);
            if (retryCount === MAX_RETRIES - 1) {
              onError?.(playError);
            }
          }
        } else {
          console.error('Max retries reached');
          onError?.(e);
        }
      };

      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded:', {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState
        });
      };

      const handleCanPlay = async () => {
        console.log('Video can play');
        if (autoPlay) {
          try {
            await video.play();
          } catch (error) {
            console.error('Erro ao iniciar reprodução:', error);
          }
        }
      };

      const handleWaiting = () => {
        console.log('Video buffering...');
      };

      const handlePlaying = () => {
        console.log('Video playing');
        setRetryCount(0); // Reset retry count when video starts playing
      };

      // Adiciona os event listeners
      video.addEventListener('error', handleError);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('playing', handlePlaying);

      // Se for HLS
      if (url.includes('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxBufferHole: 0.5,
            lowLatencyMode: true,
            backBufferLength: 90,
            enableWorker: true,
            startLevel: -1,
            abrEwmaDefaultEstimate: 500000,
            abrMaxWithRealBitrate: true,
            progressive: true,
            testBandwidth: true,
            debug: false
          });

          hlsRef.current = hls;

          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('HLS: Media attached');
            hls.loadSource(proxyUrl);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS: Manifest parsed');
            if (autoPlay) {
              video.play().catch(console.error);
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('HLS: Fatal network error... trying to recover');
                  if (retryCount < MAX_RETRIES) {
                    setRetryCount(prev => prev + 1);
                    hls.startLoad();
                  } else {
                    console.error('HLS: Max retries reached');
                    destroyPlayer();
                    onError?.(data);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('HLS: Fatal media error... trying to recover');
                  if (retryCount < MAX_RETRIES) {
                    setRetryCount(prev => prev + 1);
                    hls.recoverMediaError();
                  } else {
                    console.error('HLS: Max retries reached');
                    destroyPlayer();
                    onError?.(data);
                  }
                  break;
                default:
                  console.error('HLS: Fatal error... destroying');
                  destroyPlayer();
                  onError?.(data);
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = proxyUrl;
          if (autoPlay) {
            video.play().catch(console.error);
          }
        }
      } else {
        // Para outros tipos de vídeo
        video.src = proxyUrl;
        video.preload = 'auto';
      }

      return () => {
        cleanupListeners();
      };

    } catch (error) {
      console.error('Erro ao inicializar player:', error);
      onError?.(error);
    }
  };

  useEffect(() => {
    // Reset state on url change
    setRetryCount(0);
    setIsInitialized(false);
    
    // Cleanup previous instance
    destroyPlayer();
    
    // Initialize with small delay to ensure cleanup is complete
    const initTimer = setTimeout(() => {
      initializePlayer();
    }, 100);
    
    return () => {
      clearTimeout(initTimer);
      destroyPlayer();
    };
  }, [url, autoPlay]);

  return (
    <div className="plyr__container">
      <div className="plyr__video-wrapper">
        <video
          ref={videoRef}
          className="plyr__video"
          crossOrigin="anonymous"
          playsInline
          preload="metadata"
          poster={type === 'movie' ? `https://image.tmdb.org/t/p/w780${episodeId}` : undefined}
          onContextMenu={(e) => e.preventDefault()}
        >
          <p>
            Seu navegador não suporta o elemento de vídeo.
            Por favor, atualize para uma versão mais recente.
          </p>
        </video>
      </div>
    </div>
  );
}