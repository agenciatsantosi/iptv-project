import React, { useRef, useEffect, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { getProxiedVideoUrl } from '../../utils/videoUtils';

interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
}

export function VideoPlayer({ src, type = 'video/mp4', poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr>();
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Processar a URL do vídeo
  const videoUrl = getProxiedVideoUrl(src);

  useEffect(() => {
    if (!videoRef.current) return;

    // Configuração específica para mobile
    const mobileControls = [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'fullscreen',
    ];

    // Configuração para desktop
    const desktopControls = [
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
    ];

    // Configurações comuns para todos os dispositivos
    const commonOptions = {
      controls: isMobile ? mobileControls : desktopControls,
      settings: isMobile ? ['quality'] : ['captions', 'quality', 'speed', 'loop'],
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      clickToPlay: true,
      disableContextMenu: false,
      ratio: '16:9',
      resetOnEnd: false,
      debug: true,
      autoplay: false, // Desativar autoplay nativo do Plyr, vamos controlar manualmente
    };

    // Criar o player com configurações adaptadas
    playerRef.current = new Plyr(videoRef.current, commonOptions);

    // Adicionar listeners de eventos para debug
    if (playerRef.current) {
      playerRef.current.on('ready', () => {
        console.log('Player pronto');
      });

      playerRef.current.on('play', () => {
        console.log('Player iniciou reprodução');
        setIsPlaying(true);
      });

      playerRef.current.on('pause', () => {
        console.log('Player pausado');
        setIsPlaying(false);
      });

      playerRef.current.on('ended', () => {
        console.log('Player terminou reprodução');
        setIsPlaying(false);
      });

      // Adicionar evento para quando o player estiver pronto
      playerRef.current.on('ready', () => {
        // Tentar iniciar a reprodução após o player estar pronto
        attemptAutoplay();
      });
    }

    // Configurar eventos de erro e debug
    videoRef.current.addEventListener('error', (e) => {
      console.error('Erro no vídeo:', e);
      const video = e.target as HTMLVideoElement;
      console.error('Código do erro:', video.error?.code);
      console.error('Mensagem do erro:', video.error?.message);
      
      let errorMessage = 'Erro ao reproduzir o vídeo';
      if (video.error) {
        switch (video.error.code) {
          case 1: errorMessage = 'Reprodução abortada'; break;
          case 2: errorMessage = 'Erro de rede'; break;
          case 3: errorMessage = 'Erro ao decodificar o vídeo'; break;
          case 4: errorMessage = 'Formato não suportado'; break;
          default: errorMessage = `Erro ${video.error.code}: ${video.error.message}`;
        }
      }
      setVideoError(errorMessage);
    });

    // Tentar reproduzir automaticamente (importante para dispositivos móveis)
    const attemptAutoplay = async () => {
      try {
        if (videoRef.current && playerRef.current) {
          console.log('Tentando iniciar reprodução automática...');
          
          // Em dispositivos móveis, primeiro tentar com mudo
          if (isMobile) {
            videoRef.current.muted = true;
            playerRef.current.muted = true;
          }
          
          // Usar o método play do Plyr em vez do elemento de vídeo diretamente
          await playerRef.current.play();
          console.log('Autoplay bem-sucedido');
          setIsPlaying(true);
          
          // Se conseguir reproduzir com sucesso em dispositivos móveis, podemos tentar desativar o mudo após alguns segundos
          if (isMobile) {
            setTimeout(() => {
              if (playerRef.current && isPlaying) {
                playerRef.current.muted = false;
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.warn('Autoplay falhou:', error);
        // Se falhar, deixar o usuário iniciar manualmente
        // Em dispositivos móveis, mostrar uma mensagem ou botão grande para iniciar
        if (isMobile) {
          console.log('Autoplay falhou em dispositivo móvel, aguardando interação do usuário');
        }
      }
    };

    // Tentar reproduzir quando o vídeo estiver pronto
    videoRef.current.addEventListener('canplay', () => {
      console.log('Vídeo pode ser reproduzido');
      attemptAutoplay();
    });

    // Adicionar evento de clique no vídeo para dispositivos móveis
    if (isMobile && videoRef.current) {
      videoRef.current.addEventListener('click', () => {
        if (!isPlaying) {
          attemptAutoplay();
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [isMobile, videoUrl, isPlaying]);

  // Função para forçar a reprodução quando o usuário clicar no botão
  const handlePlayButtonClick = () => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  };

  return (
    <div className="w-full aspect-video bg-black relative">
      {videoError ? (
        <div className="absolute inset-0 flex items-center justify-center flex-col p-4 bg-black/80 text-white z-50">
          <p className="text-lg font-semibold mb-2">Não foi possível reproduzir este vídeo</p>
          <p className="text-sm text-gray-300">{videoError}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        </div>
      ) : null}
      
      {/* Overlay para dispositivos móveis quando o vídeo não está reproduzindo */}
      {isMobile && !isPlaying && !videoError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-40"
          onClick={handlePlayButtonClick}
        >
          <button 
            className="w-20 h-20 flex items-center justify-center rounded-full bg-red-600 text-white"
            onClick={handlePlayButtonClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="plyr-react plyr"
        controls
        preload="auto"
        width="100%"
        height="100%"
        poster={poster}
        playsInline // Importante para iOS
        muted // Iniciar mudo para aumentar chances de autoplay
        crossOrigin="anonymous" // Ajuda com problemas de CORS
        x-webkit-airplay="allow"
        data-plyr-config='{"title": "Video"}'
      >
        <source src={videoUrl} type={type} />
        Seu navegador não suporta o elemento de vídeo.
      </video>
    </div>
  );
}
