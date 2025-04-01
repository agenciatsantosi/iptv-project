import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIPTVStore } from '../../store/iptvStore';
import { useTMDB } from '../../hooks/useTMDB';
import { TMDBService } from '../../lib/tmdb';
import { Image } from '../ui/Image';
import { Icon } from '@chakra-ui/icons';
import { Button, IconButton, Badge } from '@chakra-ui/react';
import { FiPlay, FiHeart, FiFilm } from 'react-icons/fi';
import { Channel } from '../../types/iptv';

interface SeriesCardProps {
  series: {
    id: string;
    name: string;
    title?: string;
    episodes: Channel[];
    group?: string;
    group_title?: string;
    logo?: string | null;
  };
}

export function SeriesCard({ series }: SeriesCardProps) {
  const { user } = useAuthContext();
  const { toggleFavorite, favorites } = useIPTVStore();
  const isFavorite = favorites.includes(series.id);

  return (
    <div className="group relative">
      <Link to={`/series/${series.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
          <img
            src={series.logo || '/placeholder-series.jpg'}
            alt={series.title || series.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.src.includes('placeholder-series.jpg')) {
                img.src = '/placeholder-series.jpg';
              }
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <FiPlay className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </div>
          </div>
        </div>
        <h3 className="mt-2 text-lg font-semibold truncate">{series.title || series.name}</h3>
        {series.group_title && (
          <p className="text-sm text-gray-400 truncate">{series.group_title}</p>
        )}
        {series.episodes?.length > 0 && (
          <Badge colorScheme="purple" mt={1}>
            {series.episodes.length} episódios
          </Badge>
        )}
      </Link>

      {user && (
        <IconButton
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          icon={<FiHeart className={isFavorite ? "fill-current" : ""} />}
          onClick={() => toggleFavorite(series.id)}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
          size="sm"
        />
      )}
    </div>
  );
}
