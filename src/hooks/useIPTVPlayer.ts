import { useEffect, useRef } from 'react';
import { IPTVService } from '../services/iptv';

export function useIPTVPlayer() {
  const iptvService = useRef(new IPTVService());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      iptvService.current.destroy();
    };
  }, []);

  const initializePlayer = (streamUrl: string) => {
    if (videoRef.current) {
      iptvService.current.initializePlayer(videoRef.current, streamUrl);
    }
  };

  const setQuality = (level: number) => {
    iptvService.current.setQuality(level);
  };

  return {
    videoRef,
    initializePlayer,
    setQuality,
  };
}