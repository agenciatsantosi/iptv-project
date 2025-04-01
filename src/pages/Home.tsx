import { useEffect } from 'react';
import { useIPTVStore } from '../store/iptvStore';
import { SearchBar } from '../components/SearchBar';
import { ChannelList } from '../components/ChannelList';
import { FeaturedContent } from '../components/FeaturedContent';

export function Home() {
  const { 
    movies, 
    series, 
    live,
    watchHistory,
    favorites,
    setFilter,
    syncFromCloud,
    loadNextPage,
    loading,
    error 
  } = useIPTVStore();

  // Carrega dados iniciais ao montar
  useEffect(() => {
    syncFromCloud();
  }, []);

  // Filtra conteúdo assistido recentemente
  const recentlyWatched = watchHistory
    .map(id => [...movies, ...series, ...live].find(item => item.id === id))
    .filter(Boolean);

  // Filtra favoritos
  const favoriteContent = favorites
    .map(id => [...movies, ...series, ...live].find(item => item.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      {movies.length > 0 && <FeaturedContent />}

      {/* Barra de Pesquisa */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
        <SearchBar onSearch={setFilter} />
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="text-red-500 text-center py-4">
            {error}
          </div>
        )}

        {loading && movies.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {/* Lista de Canais */}
        <div className="space-y-8">
          {recentlyWatched.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Continue Assistindo</h2>
              <ChannelList channels={recentlyWatched} />
            </section>
          )}

          {favoriteContent.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Minha Lista</h2>
              <ChannelList channels={favoriteContent} />
            </section>
          )}

          {live.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Canais ao Vivo</h2>
              <ChannelList channels={live} onLoadMore={loadNextPage} />
            </section>
          )}

          {movies.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Filmes</h2>
              <ChannelList channels={movies} onLoadMore={loadNextPage} />
            </section>
          )}

          {series.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Séries</h2>
              <ChannelList channels={series} onLoadMore={loadNextPage} />
            </section>
          )}

          {!loading && !error && movies.length === 0 && series.length === 0 && live.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl text-white">Nenhum conteúdo encontrado</h3>
              <p className="text-gray-400 mt-2">Tente ajustar sua busca ou aguarde o carregamento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
