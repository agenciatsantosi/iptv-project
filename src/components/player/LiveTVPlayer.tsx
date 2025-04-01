import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { useLiveTV } from '@/hooks/useLiveTV';
import { VideoControls } from './VideoControls';
import { useVideoState } from '@/hooks/useVideoState';

interface LiveTVPlayerProps {
  channelId: string;
}

export function LiveTVPlayer({ channelId }: LiveTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { isLoading, error, streamUrl, channelInfo, retryStream } = useLiveTV({ 
    channelId,
    autoPlay: true 
  });
  const {
    playing,
    volume,
    muted,
    played,
    seeking,
    quality,
    showControls,
    togglePlay,
    handleVolumeChange,
    handleToggleMute,
    handleSeek,
    handleQualityChange,
    handleMouseMove,
    handleMouseLeave,
  } = useVideoState();

  // Efeito para lidar com o stream
  useEffect(() => {
    const video = videoRef.current;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    if (!video || !streamUrl) {
      console.log('Aguardando recursos:', { video: !!video, streamUrl });
      return;
    }

    console.log('Iniciando player com URL:', streamUrl);

    const initPlayer = async () => {
      if (!video || !streamUrl) return;

      // Limpar instância anterior do HLS se existir
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Tenta primeiro com HLS
      if (Hls.isSupported()) {
        console.log('HLS suportado, iniciando...');
        const hls = new Hls({
          debug: true,
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadPolicy: {
            default: {
              maxTimeToFirstByteMs: 20000,
              maxLoadTimeMs: 20000,
              timeoutRetry: {
                maxNumRetry: 2,
                retryDelayMs: 1000,
                maxRetryDelayMs: 0
              }
            }
          },
          fragLoadPolicy: {
            default: {
              maxTimeToFirstByteMs: 20000,
              maxLoadTimeMs: 20000,
              timeoutRetry: {
                maxNumRetry: 2,
                retryDelayMs: 1000,
                maxRetryDelayMs: 0
              }
            }
          }
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS: Media attached');
          video.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, async (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Erro de rede, tentando recuperar...');
                if (retryCount < MAX_RETRIES) {
                  retryCount++;
                  retryTimeout = setTimeout(() => {
                    console.log(`Tentativa ${retryCount} de ${MAX_RETRIES}`);
                    initPlayer();
                  }, 2000);
                } else {
                  console.log('Máximo de tentativas HLS atingido, tentando reprodução direta...');
                  hls.destroy();
                  retryStream();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Erro de mídia, tentando recuperar...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Erro fatal:', data);
                retryStream();
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('HLS suportado nativamente');
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(console.error);
        });
      } else {
        console.error('HLS não suportado');
        retryStream();
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      clearTimeout(retryTimeout);
    };
  }, [streamUrl, retryStream]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-t-transparent border-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={retryStream}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        autoPlay
        muted={muted}
        volume={volume}
      />
      <VideoControls
        visible={showControls}
        playing={playing}
        volume={volume}
        muted={muted}
        played={played}
        seeking={seeking}
        qualities={[]}
        currentQuality={quality}
        bufferStatus={false}
        isLive={true}
        onPlayPause={togglePlay}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onSeek={handleSeek}
        onQualityChange={handleQualityChange}
        onRefresh={retryStream}
        onFullscreen={handleFullscreen}
      />
    </div>
  );
}
