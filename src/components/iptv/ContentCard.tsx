import React, { useState } from 'react';
import { Play, Info, Heart, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Channel } from '../../types/iptv';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIPTVStore } from '../../store/iptvStore';
import { useTMDB } from '../../hooks/useTMDB';
import { TMDBService } from '../../lib/tmdb';

interface ContentCardProps {
  channel: Channel;
  showFavorite?: boolean;
}

export function ContentCard({ channel, showFavorite = true }: ContentCardProps) {
  const { isAuthenticated } = useAuthContext();
  const { favorites, toggleFavorite } = useIPTVStore();
  const [isHovered, setIsHovered] = useState(false);

  // Busca metadados do TMDB
  const { data: metadata } = useTMDB(channel.name, channel.group?.toLowerCase().includes('serie') ? 'tv' : 'movie');

  const isFavorite = favorites.some(fav => fav.id === channel.id);

  // Pega a URL da imagem do canal IPTV primeiro, se não houver usa TMDB
  const imageUrl = channel.thumbnailPath || channel.logo || 
    (metadata?.poster_path ? TMDBService.getImageUrl(metadata.poster_path, 'w500') : '/placeholder-movie.jpg');

  return (
    <div 
      className="group relative aspect-[2/3] rounded-md overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <img
        src={imageUrl}
        alt={channel.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          // Se a imagem falhar, usa o placeholder
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-movie.jpg';
        }}
      />

      {/* Overlay Gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Content */}
      <div 
        className={`absolute inset-x-0 bottom-0 p-4 space-y-4 transition-transform duration-300 ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <h3 className="text-lg font-semibold line-clamp-2">
          {metadata?.title || metadata?.name || channel.name}
        </h3>

        <div className="flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to={channel.group?.toLowerCase().includes('serie') ? `/series/${channel.id}` : `/movies/${channel.id}`}
                className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-md hover:bg-white/30 transition"
              >
                <Info className="w-4 h-4" />
                <span>Detalhes</span>
              </Link>

              <Link
                to={`/tv/watch/${channel.id}`}
                className="flex items-center justify-center gap-2 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition"
              >
                <Play className="w-4 h-4" />
                <span>Assistir</span>
              </Link>

              {showFavorite && (
                <button
                  onClick={() => toggleFavorite(channel)}
                  className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-md hover:bg-white/30 transition"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
                </button>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition"
            >
              <Play className="w-4 h-4" />
              <span>Fazer Login para Assistir</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}