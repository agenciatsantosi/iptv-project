import React from 'react';
import { Heart, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Channel } from '../../types/iptv';
import { cn } from '../../lib/utils';

interface IPTVChannelCardProps {
  channel: Channel;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function IPTVChannelCard({
  channel,
  isFavorite,
  onToggleFavorite,
}: IPTVChannelCardProps) {
  return (
    <div className="bg-zinc-800 p-4 rounded-lg hover:bg-zinc-700 transition group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-10 h-10 object-contain rounded bg-zinc-900"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-400">
                {channel.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-white">{channel.name}</h3>
            <p className="text-sm text-gray-400">{channel.group}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className="p-2 hover:bg-zinc-600 rounded-full transition"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={cn(
                'w-5 h-5',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              )}
            />
          </button>
          
          <Link
            to={`/tv/watch/${channel.id}`}
            className="p-2 hover:bg-purple-600 rounded-full transition opacity-0 group-hover:opacity-100"
          >
            <Play className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}