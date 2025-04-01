import { useEffect, useRef, useCallback } from 'react';
import { useIPTVStore } from '../store/iptvStore';
import { Channel } from '../types/iptv';

interface ChannelListProps {
  type?: 'movies' | 'series' | 'live';
}

export function ChannelList({ type }: ChannelListProps) {
  const { 
    movies,
    series, 
    live,
    loading,
    hasMore,
    loadNextPage,
    filter
  } = useIPTVStore();

  // Referência para o elemento observado
  const observer = useRef<IntersectionObserver>();
  
  // Referência para o último item da lista
  const lastChannelRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;

    // Desconecta o observer anterior
    if (observer.current) observer.current.disconnect();

    // Cria novo observer
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadNextPage();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadNextPage]);

  // Lista de canais filtrada por tipo
  const channels = type ? 
    type === 'movies' ? movies :
    type === 'series' ? series :
    live : 
    [...movies, ...series, ...live];

  if (!channels.length && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">
          {filter ? 'Nenhum canal encontrado' : 'Carregando canais...'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {channels.map((channel, index) => (
        <div
          key={channel.id}
          ref={index === channels.length - 1 ? lastChannelRef : undefined}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              {channel.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {channel.type}
            </p>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="col-span-full flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}
    </div>
  );
}
