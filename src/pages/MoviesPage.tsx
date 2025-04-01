import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { MovieCard } from '../components/iptv/MovieCard';
import { GroupSelector } from '../components/iptv/GroupSelector';
import { AuthProtection } from '../components/auth/AuthProtection';
import { useInfiniteChannels } from '../hooks/useInfiniteChannels';
import { InfiniteScroll } from '../components/shared/InfiniteScroll';

export function MoviesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    channels: movies, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    total,
    isLoadingMore
  } = useInfiniteChannels('movie');

  // Remove duplicatas e pega todos os grupos
  const uniqueMovies = useMemo(() => 
    Array.from(new Map(movies.map(movie => [movie.id, movie])).values()),
    [movies]
  );

  const groups = useMemo(() => {
    const uniqueGroups = new Set(uniqueMovies.map(movie => movie.group_title || 'Sem Grupo'));
    return Array.from(uniqueGroups).sort();
  }, [uniqueMovies]);

  // Filtra filmes pelo grupo selecionado e busca
  const filteredMovies = useMemo(() => {
    let filtered = selectedGroup 
      ? uniqueMovies.filter(movie => movie.group_title === selectedGroup)
      : uniqueMovies;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(movie => (
        movie.name?.toLowerCase().includes(term) ||
        movie.full_name?.toLowerCase().includes(term) ||
        movie.genres?.some(genre => genre.toLowerCase().includes(term))
      ));
    }

    return filtered;
  }, [uniqueMovies, selectedGroup, searchTerm]);

  return (
    <AuthProtection>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
        {/* Header Fixo */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-black/0 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            {/* Navegação */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                    Filmes
                  </h1>
                  {!isLoading && (
                    <p className="text-sm text-white/60">
                      {total} filmes disponíveis
                    </p>
                  )}
                </div>
              </div>

              {/* Barra de Busca */}
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Buscar filmes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              </div>
            </div>

            {/* Seletor de Grupo */}
            <div className="mt-6">
              <GroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 pt-48 pb-8">
          {error && (
            <div className="text-red-500 text-center py-4">
              Erro ao carregar filmes: {error}
            </div>
          )}

          <InfiniteScroll
            hasMore={hasMore}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          >
            {/* Grid de Filmes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </AuthProtection>
  );
}