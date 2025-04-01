import React, { useState } from 'react';
import { Play, Info, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types/iptv';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIPTVStore } from '../../store/iptvStore';
import { useTMDB } from '../../hooks/useTMDB';
import { TMDBService } from '../../lib/tmdb';
import { Image } from '../ui/Image';

// Função para validar URLs
function isValidUrl(url?: string): boolean {
  try {
    if (!url) return false;
    // Aceita URLs absolutas ou caminhos relativos que começam com /
    return url.startsWith('http') || url.startsWith('/');
  } catch {
    return false;
  }
}

interface MovieCardProps {
  movie: Movie;
  showFavorite?: boolean;
}

export function MovieCard({ movie, showFavorite = true }: MovieCardProps) {
  const { isAuthenticated } = useAuthContext();
  const { favorites, toggleFavorite } = useIPTVStore();
  const [isHovered, setIsHovered] = useState(false);

  // Busca metadados do TMDB apenas quando o componente estiver visível
  const { data: metadata } = useTMDB(isHovered && movie?.name ? movie.name : '', 'movie');

  const isFavorite = favorites.some(fav => fav.id === movie?.id);

  // Pega a URL da imagem do canal IPTV primeiro, se não houver usa TMDB
  const getValidImageUrl = () => {
    if (!movie) return '/placeholder-movie.jpg';
    
    if (isValidUrl(movie.logo)) {
      return movie.logo;
    }
    // Só busca imagem do TMDB se o componente estiver visível
    if (isHovered && metadata?.poster_path) {
      return TMDBService.getImageUrl(metadata.poster_path, 'w500');
    }
    return '/placeholder-movie.jpg';
  };

  if (!movie) {
    return null;
  }

  const imageUrl = getValidImageUrl();
  const title = metadata?.title || movie.name || movie.full_name;
  const year = movie.year ? ` (${movie.year})` : '';

  return (
    <div 
      className="group relative aspect-[2/3] rounded-md overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <Image
        src={imageUrl}
        alt={title}
        title={title}
        fallbackTitle={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        fallback={
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-400 text-sm text-center p-4">
              {title}
            </span>
          </div>
        }
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
        <div className="space-y-1">
          <h3 className="text-lg font-semibold line-clamp-2">
            {title}{year}
          </h3>
          {movie.genres && movie.genres.length > 0 && (
            <p className="text-sm text-gray-300">
              {movie.genres.join(', ')}
            </p>
          )}
          {movie.duration && (
            <p className="text-sm text-gray-400">
              {Math.floor(movie.duration / 60)}h {movie.duration % 60}min
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to={`/content/${movie.id}`}
                className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-md hover:bg-white/30 transition"
              >
                <Info className="w-4 h-4" />
                <span>Detalhes</span>
              </Link>

              <Link
                to={`/watch/${movie.id}`}
                className="flex items-center justify-center gap-2 py-2 bg-red-500 rounded-md hover:bg-red-600 transition"
              >
                <Play className="w-4 h-4" />
                <span>Assistir</span>
              </Link>

              {showFavorite && (
                <button
                  onClick={() => toggleFavorite(movie)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-md transition ${
                    isFavorite 
                      ? 'bg-pink-500 hover:bg-pink-600' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
                </button>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-md hover:bg-white/30 transition"
            >
              <span>Faça login para assistir</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
