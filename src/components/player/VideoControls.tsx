import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoControlsProps {
  visible: boolean;
  playing: boolean;
  volume: number;
  muted: boolean;
  played: number;
  seeking: boolean;
  qualities: { value: number; label: string }[];
  currentQuality: number;
  bufferStatus: boolean;
  isLive?: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onSeek: (value: number) => void;
  onQualityChange: (quality: number) => void;
  onRefresh: () => void;
  onFullscreen: () => void;
}

export function VideoControls({
  visible,
  playing,
  volume,
  muted,
  played,
  seeking,
  qualities,
  currentQuality,
  bufferStatus,
  isLive = false,
  onPlayPause,
  onVolumeChange,
  onToggleMute,
  onSeek,
  onQualityChange,
  onRefresh,
  onFullscreen,
}: VideoControlsProps) {
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Esconde os controles quando o mouse não se move
  useEffect(() => {
    if (!visible) {
      setShowQualityMenu(false);
      setShowVolumeSlider(false);
    }
  }, [visible]);

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Barra de Progresso (apenas para VOD) */}
      {!isLive && (
        <div className="px-4 mb-2">
          <div className="relative h-1 bg-white/30 rounded-full">
            <div
              className="absolute h-full bg-red-500 rounded-full"
              style={{ width: `${played * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Controles Principais */}
      <div className="px-4 py-2 flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          {playing ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Volume */}
        <div className="relative flex items-center">
          <button
            onClick={onToggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Volume Slider */}
          {showVolumeSlider && (
            <div
              className="absolute bottom-full left-0 mb-2 p-2 bg-black/80 rounded-lg"
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-red-500"
              />
            </div>
          )}
        </div>

        {/* Status ao Vivo */}
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-white">AO VIVO</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Refresh (apenas para live) */}
        {isLive && (
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Qualidade */}
        {qualities.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>

            {/* Menu de Qualidade */}
            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/80 rounded-lg">
                {qualities.map((quality) => (
                  <button
                    key={quality.value}
                    onClick={() => {
                      onQualityChange(quality.value);
                      setShowQualityMenu(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-sm text-left rounded hover:bg-white/10 transition",
                      currentQuality === quality.value ? "text-red-500" : "text-white"
                    )}
                  >
                    {quality.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tela Cheia */}
        <button
          onClick={onFullscreen}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <Maximize className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
