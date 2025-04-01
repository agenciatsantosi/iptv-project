import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (!videoRef.current) return;

    // Criar o player
    playerRef.current = new Plyr(videoRef.current, {
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
    });

    // Configurar eventos de erro e debug
    videoRef.current.addEventListener('error', (e) => {
      console.error('Erro no vídeo:', e);
      const video = e.target as HTMLVideoElement;
      console.error('Código do erro:', video.error?.code);
      console.error('Mensagem do erro:', video.error?.message);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full aspect-video bg-black">
      <video
        ref={videoRef}
        className="plyr-react plyr"
        controls
        preload="auto"
        width="100%"
        height="100%"
        poster={poster}
        src={getProxiedVideoUrl(src)}
      >
        <source src={getProxiedVideoUrl(src)} type={type} />
        Seu navegador não suporta o elemento de vídeo.
      </video>
    </div>
  );
}
