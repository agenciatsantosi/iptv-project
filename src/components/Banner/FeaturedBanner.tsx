import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { useIPTVStore } from '../../store/iptvStore';
import { Channel } from '../../types/iptv';
import { useTMDB } from '../../hooks/useTMDB';
import { TMDBService } from '../../lib/tmdb';

interface FeaturedBannerProps {
  selectedGroups?: string[]; // Grupos selecionados pelo admin
}

export function FeaturedBanner({ selectedGroups = ['FILMES: LANÇAMENTOS 2024'] }: FeaturedBannerProps) {
  const { movies } = useIPTVStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState<Channel[]>([]);

  // Filtra filmes dos grupos selecionados
  useEffect(() => {
    const filtered = movies.filter(movie => 
      selectedGroups.some(group => movie.group?.includes(group))
    );
    setFeaturedMovies(filtered);
  }, [movies, selectedGroups]);

  // Rotaciona os filmes a cada 10 segundos
  useEffect(() => {
    if (featuredMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(current => 
        current === featuredMovies.length - 1 ? 0 : current + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [featuredMovies]);

  const currentMovie = featuredMovies[currentIndex];
  const { data: metadata } = useTMDB(currentMovie?.name || '', 'movie');

  if (!currentMovie) return null;

  const backdropUrl = metadata?.backdrop_path 
    ? TMDBService.getImageUrl(metadata.backdrop_path, 'original')
    : `https://picsum.photos/seed/${currentMovie.id}/1920/1080`;

  return (
    <div className="relative h-[70vh] bg-zinc-900">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={currentMovie.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            {currentMovie.name}
          </h1>

          {metadata?.overview && (
            <p className="text-lg text-white/80 mb-8 max-w-3xl">
              {metadata.overview}
            </p>
          )}

          <div className="flex gap-4">
            <Link
              to={`/watch/${currentMovie.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              <Play className="w-5 h-5" />
              <span>Assistir</span>
            </Link>

            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-md hover:bg-white/30 transition"
            >
              <Info className="w-5 h-5" />
              <span>Mais Informações</span>
            </button>
          </div>

          {/* Indicadores */}
          {featuredMovies.length > 1 && (
            <div className="flex gap-2 mt-8">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentIndex ? 'bg-purple-500' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
