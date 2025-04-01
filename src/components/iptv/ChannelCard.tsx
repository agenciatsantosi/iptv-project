import React from 'react';
import { Heart, Image as ImageIcon } from 'lucide-react';
import { Channel } from '../../types/iptv';
import { Image } from '../ui/Image';

interface ChannelCardProps {
  channel: Channel;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ChannelCard({ channel, isFavorite, onToggleFavorite }: ChannelCardProps) {
  return (
    <div className="bg-zinc-800 p-4 rounded-lg hover:bg-zinc-700 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src={channel.logo} 
            alt={channel.name} 
            className="w-10 h-10 object-contain bg-zinc-900 rounded"
            fallback={
              <div className="w-10 h-10 bg-zinc-900 rounded flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-zinc-700" />
              </div>
            }
          />
          <div>
            <h3 className="font-medium text-white">{channel.name}</h3>
            <p className="text-sm text-gray-400">{channel.group}</p>
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          className="p-2 hover:bg-zinc-600 rounded-full transition"
        >
          <Heart
            className={\`w-5 h-5 \${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }\`}
          />
        </button>
      </div>
    </div>
  );
}