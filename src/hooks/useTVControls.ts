import { useEffect, useCallback } from 'react';

interface TVControlsOptions {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onEnter?: () => void;
  onBack?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  enabled?: boolean;
}

export const useTVControls = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onEnter,
  onBack,
  onPlay,
  onPause,
  enabled = true
}: TVControlsOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onRight?.();
        break;
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
      case 'Backspace':
        event.preventDefault();
        onBack?.();
        break;
      case ' ': // Spacebar
        event.preventDefault();
        onPlay?.();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        onPause?.();
        break;
    }
  }, [enabled, onUp, onDown, onLeft, onRight, onEnter, onBack, onPlay, onPause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
