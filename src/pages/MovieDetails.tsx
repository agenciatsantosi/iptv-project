import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { useIPTVStore } from '../store/iptvStore';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';
import { useTMDB } from '../hooks/useTMDB';
import { TMDBService } from '../lib/tmdb';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const { movies, channels } = useIPTVStore();
  
  // Tenta encontrar o filme primeiro na lista de filmes, depois em todos os canais
  const movie = useMemo(() => {
    const fromMovies = movies.find(m => m.id === id);
    if (fromMovies) return fromMovies;
    
    const fromChannels = channels.find(c => c.id === id);
    if (fromChannels && fromChannels.group?.toLowerCase().includes('filme')) {
      return fromChannels;
    }
    
    return null;
  }, [id, movies, channels]);

  const [isPlaying, setIsPlaying] = React.useState(false);

  // Limpa o título antes de passar para o hook
  const cleanTitle = useMemo(() => {
    if (!movie?.name) return '';
    // Remove caracteres especiais e espaços extras
    return movie.name
      .replace(/[-.]$/, '') // Remove hífen ou ponto no final
      .replace(/\[.*?\]|\(.*?\)/g, '') // Remove conteúdo entre colchetes/parênteses
      .replace(/\b(1080p|720p|480p|HDRip|BRRip|BluRay)\b/gi, '') // Remove qualidade
      .trim();
  }, [movie?.name]);

  // Debug logs
  useEffect(() => {
    console.log('MovieDetails - Movie:', {
      id,
      originalName: movie?.name,
      cleanTitle,
      found: !!movie,
      type: 'movie'
    });
  }, [id, movie, cleanTitle]);

  const { data: metadata, loading, error } = useTMDB(cleanTitle, 'movie');

  // Debug logs
  useEffect(() => {
    console.log('MovieDetails - TMDB Data:', {
      loading,
      error,
      hasMetadata: !!metadata,
      metadataTitle: metadata?.title
    });
  }, [loading, error, metadata]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Filme não encontrado</h2>
          <Link 
            to="/movies" 
            className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para lista de filmes</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="h-screen bg-black">
        <VideoPlayer
          url={movie.url}
          title={movie.name}
        />
      </div>
    );
  }

  const backdropUrl = metadata?.backdrop_path 
    ? TMDBService.getImageUrl(metadata.backdrop_path, 'original')
    : `https://picsum.photos/seed/${movie.id}/1920/1080`;

  const posterUrl = metadata?.poster_path
    ? TMDBService.getImageUrl(metadata.poster_path, 'w500')
    : `https://picsum.photos/seed/${movie.id}/300/450`;

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero com backdrop */}
      <div className="relative h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={metadata?.title || movie.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60" />
        </div>

        <div className="absolute top-4 left-4">
          <Link
            to="/movies"
            className="flex items-center gap-2 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto flex gap-8">
            {/* Poster */}
            <div className="hidden md:block w-[300px] aspect-[2/3] rounded-lg overflow-hidden">
              <img
                src={posterUrl}
                alt={metadata?.title || movie.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-4">
                {metadata?.title || movie.name}
              </h1>

              {metadata?.overview && (
                <p className="text-lg text-white/80 mb-8 max-w-3xl">
                  {metadata.overview}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  <Play className="w-5 h-5" />
                  <span>Assistir Agora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo adicional */}
      <div className="container mx-auto px-4 py-12">
        {metadata && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Detalhes */}
            <div className="space-y-4 text-white/80">
              {metadata.release_date && (
                <div>
                  <h3 className="text-white font-semibold mb-1">Lançamento</h3>
                  <p>{new Date(metadata.release_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {metadata.genres && metadata.genres.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-1">Gêneros</h3>
                  <div className="flex flex-wrap gap-2">
                    {metadata.genres.map(genre => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="space-y-4 text-white/80">
              {metadata.vote_average > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-1">Avaliação</h3>
                  <p>{(metadata.vote_average * 10).toFixed(0)}% gostaram</p>
                </div>
              )}
              
              {metadata.runtime > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-1">Duração</h3>
                  <p>{metadata.runtime} minutos</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}