import React from 'react';
import { Search } from 'lucide-react';
import { Channel } from '../../types/iptv';
import { IPTVChannelCard } from './IPTVChannelCard';
import { IPTVChannelFilters } from './IPTVChannelFilters';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useIPTVStore } from '../../store/iptvStore';

interface IPTVChannelListProps {
  type: 'movies' | 'series' | 'live';
}

export function IPTVChannelList({ type }: IPTVChannelListProps) {
  const { movies, series, live, favorites, toggleFavorite } = useIPTVStore();
  const [search, setSearch] = React.useState('');
  const [selectedGroup, setSelectedGroup] = React.useState<string>('all');
  
  const debouncedSearch = useDebounce(search);

  // Seleciona a lista correta baseado no tipo
  const channels = React.useMemo(() => {
    switch (type) {
      case 'movies':
        return movies;
      case 'series':
        return series;
      case 'live':
        return live;
      default:
        return [];
    }
  }, [type, movies, series, live]);

  // Filtra os canais
  const filteredChannels = React.useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch = channel.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesGroup = selectedGroup === 'all' || channel.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [channels, debouncedSearch, selectedGroup]);

  const { displayedItems, containerRef, hasMore } = useInfiniteScroll({
    items: filteredChannels,
    pageSize: 24
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg text-white placeholder-gray-400"
          />
        </div>

        {/* Filtros */}
        <IPTVChannelFilters
          channels={channels}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
        />
      </div>

      {/* Lista de canais */}
      <div 
        ref={containerRef}
        className="h-[calc(100vh-200px)] overflow-y-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map((channel) => (
            <IPTVChannelCard
              key={channel.id}
              channel={channel}
              isFavorite={favorites.includes(channel.id)}
              onToggleFavorite={() => toggleFavorite(channel.id)}
            />
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>
    </div>
  );
}