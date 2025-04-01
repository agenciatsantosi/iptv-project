import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPreviewOptions {
  url: string;
  autoplay?: boolean;
  startTime?: number;
  muted?: boolean;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export function useVideoPreview({
  url,
  autoplay = true,
  startTime = 0,
  muted = true,
  onReady,
  onError,
}: VideoPreviewOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [error, setError] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoRef.current || !url) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    const initializeVideo = async () => {
      try {
        if (Hls.isSupported()) {
          hls = new Hls({
            startPosition: startTime,
            debug: false,
          });
          
          hlsRef.current = hls;
          
          hls.loadSource(url);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsReady(true);
            onReady?.();
            if (autoplay) {
              video.play()
                .then(() => setIsPlaying(true))
                .catch((e) => {
                  console.error('Autoplay failed:', e);
                  setError(e);
                  onError?.(e);
                });
            }
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setError(data);
              onError?.(data);
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Fallback para Safari
          video.src = url;
          video.addEventListener('loadedmetadata', () => {
            setIsReady(true);
            onReady?.();
            if (autoplay) {
              video.play()
                .then(() => setIsPlaying(true))
                .catch((e) => {
                  console.error('Autoplay failed:', e);
                  setError(e);
                  onError?.(e);
                });
            }
          });
        }

        video.muted = muted;
      } catch (e) {
        setError(e);
        onError?.(e);
      }
    };

    initializeVideo();

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [url, autoplay, startTime, muted, onReady, onError]);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (e) {
      setError(e);
      onError?.(e);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  };

  return {
    videoRef,
    isReady,
    isPlaying,
    isMuted,
    error,
    togglePlay,
    toggleMute,
    seekTo,
  };
}
