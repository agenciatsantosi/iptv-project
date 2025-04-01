import React from 'react';
import { Volume2, VolumeX, Maximize, Subtitles, Settings, Pause, Play, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VideoControlsProps {
  visible: boolean;
  playing: boolean;
  volume: number;
  muted: boolean;
  played: number;
  seeking: boolean;
  qualities?: Array<{ label: string; url: string }>;
  currentQuality: number;
  bufferStatus: number;
  isLive?: boolean;
  onPlayPause: () => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  onSeek: (value: number) => void;
  onQualityChange: (index: number) => void;
  onRefresh?: () => void;
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
  isLive,
  onPlayPause,
  onVolumeChange,
  onToggleMute,
  onSeek,
  onQualityChange,
  onRefresh,
  onFullscreen,
}: VideoControlsProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Buffer indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600">
        <div
          className="h-full bg-purple-600/50"
          style={{ width: `${bufferStatus * 100}%` }}
        />
      </div>

      {/* Progress bar */}
      {!isLive && (
        <div className="relative w-full h-1 bg-gray-600 cursor-pointer mb-4">
          <div
            className="absolute h-full bg-purple-600"
            style={{ width: `${played * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={played}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPlayPause}
            className="text-white hover:text-gray-300"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleMute}
              className="text-white hover:text-gray-300"
              aria-label={muted ? 'Ativar som' : 'Desativar som'}
            >
              {muted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24"
              aria-label="Volume"
            />
          </div>

          {isLive && onRefresh && (
            <button
              onClick={onRefresh}
              className="text-white hover:text-gray-300"
              aria-label="Atualizar stream"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white hover:text-gray-300" aria-label="Legendas">
            <Subtitles className="w-6 h-6" />
          </button>
          
          {qualities && (
            <div className="relative group">
              <button className="text-white hover:text-gray-300" aria-label="Configurações">
                <Settings className="w-6 h-6" />
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-black/90 rounded p-2">
                  {qualities.map((quality, index) => (
                    <button
                      key={quality.label}
                      onClick={() => onQualityChange(index)}
                      className={cn(
                        'block w-full px-4 py-1 text-sm text-left',
                        currentQuality === index
                          ? 'text-purple-500'
                          : 'text-white hover:text-gray-300'
                      )}
                    >
                      {quality.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={onFullscreen}
            className="text-white hover:text-gray-300" 
            aria-label="Tela cheia"
          >
            <Maximize className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}