import React from 'react';
import { type Channel } from '../../types/iptv';
import { Tv } from 'lucide-react';

interface ContentThumbnailProps {
  channel: Channel;
}

export function ContentThumbnail({ channel }: ContentThumbnailProps) {
  return (
    <div className="aspect-video bg-zinc-900 relative">
      {channel.logo ? (
        <img
          src={channel.logo}
          alt={channel.name}
          className="w-full h-full object-contain p-4"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <Tv className="w-12 h-12 text-zinc-700 mb-2" />
          <span className="text-lg font-medium text-zinc-700 text-center line-clamp-2">
            {channel.name}
          </span>
        </div>
      )}
    </div>
  );
}