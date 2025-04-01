import React from 'react';
import { Play } from 'lucide-react';
import { Channel } from '../../types/iptv';
import { Link } from 'react-router-dom';

interface LiveCardProps {
  channel: Channel;
}

export function LiveCard({ channel }: LiveCardProps) {
  return (
    <Link
      to={`/watch/${channel.id}`}
      className="group relative overflow-hidden rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
    >
      {/* Thumbnail ou Logo */}
      <div className="aspect-video relative overflow-hidden bg-black">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-purple-600/20">
            <span className="text-2xl font-bold text-white/50">
              {channel.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Overlay com efeito hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Badge "AO VIVO" */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 rounded text-xs font-semibold">
          AO VIVO
        </div>
      </div>

      {/* Informações do Canal */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-red-500 transition-colors duration-300 line-clamp-1">
          {channel.name}
        </h3>
        
        <p className="text-sm text-white/60 mt-1 line-clamp-1">
          {channel.group_title || 'Sem categoria'}
        </p>

        {/* Metadados adicionais */}
        {(channel.country || channel.language) && (
          <div className="flex items-center gap-2 mt-2">
            {channel.country && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">
                {channel.country}
              </span>
            )}
            {channel.language && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">
                {channel.language}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
