import { useState, useCallback, useRef } from 'react';

export function useVideoState() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [quality, setQuality] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number>();

  const togglePlay = useCallback(() => {
    setPlaying(prev => !prev);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

  const handleSeek = useCallback((value: number) => {
    setPlayed(value);
  }, []);

  const handleQualityChange = useCallback((index: number) => {
    setQuality(index);
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowControls(false);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  return {
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
  };
}