import { useCallback, useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';

interface UseVideoPlayerProps {
  url: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  onReady?: () => void;
}

export function useVideoPlayer({
  url,
  onProgress,
  onEnded,
  onReady
}: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const processIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const PROXY_BASE_URL = 'http://localhost:3001'; // URL base do proxy

  const handleProgress = useCallback(() => {
    if (!videoRef.current) return;

    const duration = videoRef.current.duration;
    const currentTime = videoRef.current.currentTime;
    
    if (duration > 0) {
      const progress = currentTime / duration;
      setPlayed(progress);
      onProgress?.(progress);
    }

    // Calculate buffer progress
    const buffered = videoRef.current.buffered;
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      setBuffered(bufferedEnd / duration);
    }
  }, [onProgress]);

  const initialize = useCallback(async () => {
    if (!url) {
      console.error('URL não fornecida');
      setError('URL não fornecida');
      setLoading(false);
      return;
    }

    console.log('Inicializando player com URL:', url);
    const video = videoRef.current;
    if (!video) {
      console.error('Elemento de vídeo não encontrado');
      setError('Erro ao inicializar player');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Cleanup previous instance
    if (hlsRef.current) {
      console.log('Destruindo instância anterior do HLS');
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Cleanup previous FFmpeg process if exists
    if (processIdRef.current) {
      console.log('Parando processo FFmpeg anterior:', processIdRef.current);
      try {
        const stopResponse = await fetch(`${PROXY_BASE_URL}/stream/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processId: processIdRef.current })
        });
        
        if (!stopResponse.ok) {
          console.error('Erro ao parar processo:', await stopResponse.text());
        }
      } catch (error) {
        console.error('Error stopping previous stream:', error);
      }
      processIdRef.current = null;
    }

    // Setup event listeners
    video.addEventListener('timeupdate', handleProgress);
    video.addEventListener('ended', onEnded);

    try {
      console.log('Iniciando streaming...');
      const proxyUrl = new URL('/stream', PROXY_BASE_URL);
      proxyUrl.searchParams.set('url', url);
      console.log('URL do proxy:', proxyUrl.toString());
      
      // Usar diretamente a URL do proxy no player
      video.src = proxyUrl.toString();
      
      video.addEventListener('loadedmetadata', () => {
        video.play()
          .then(() => {
            console.log('Reprodução iniciada com sucesso');
            setPlaying(true);
            setLoading(false);
            onReady?.();
          })
          .catch(error => {
            console.error('Error playing video:', error);
            setError('Erro ao iniciar reprodução');
            setLoading(false);
          });
      });

      video.addEventListener('error', () => {
        console.error('Erro no player:', video.error);
        setError('Erro ao reproduzir vídeo');
        setLoading(false);
      });

    } catch (error) {
      console.error('Error initializing player:', error);
      setError('Erro ao inicializar player');
      setLoading(false);
    }

    return () => {
      video.removeEventListener('timeupdate', handleProgress);
      video.removeEventListener('ended', onEnded);
    };
  }, [url, onEnded, onReady, handleProgress, retryCount]);

  useEffect(() => {
    initialize();

    return () => {
      // Cleanup on unmount
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (processIdRef.current) {
        fetch(`${PROXY_BASE_URL}/stream/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processId: processIdRef.current })
        }).catch(console.error);
      }
    };
  }, [initialize]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        setError('Erro ao iniciar reprodução.');
      });
    }
    setPlaying(!playing);
  }, [playing]);

  const handleVolumeChange = useCallback((value: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = value;
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    videoRef.current.muted = newMuted;
    setMuted(newMuted);
  }, [muted]);

  const handleSeek = useCallback((value: number) => {
    if (!videoRef.current) return;
    const time = value * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setPlayed(value);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setLoading(true);
    initialize();
  }, [initialize]);

  return {
    videoRef,
    loading,
    error,
    playing,
    volume,
    muted,
    played,
    buffered,
    handlePlayPause,
    handleVolumeChange,
    handleToggleMute,
    handleSeek,
    handleFullscreen,
    handleRetry,
    initialize
  };
}