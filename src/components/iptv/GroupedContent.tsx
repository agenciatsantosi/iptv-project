import React from 'react';
import { Channel } from '../../types/iptv';
import { Search } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ContentCard } from './ContentCard';
import { useIPTVStore } from '../../store/iptvStore';
import { useDebounce } from '../../hooks/useDebounce';

interface GroupedContentProps {
  channels: Channel[];
}

export function GroupedContent({ channels }: GroupedContentProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [search, setSearch] = React.useState('');
  const [selectedGroup, setSelectedGroup] = React.useState('all');
  const { favorites, toggleFavorite } = useIPTVStore();
  const debouncedSearch = useDebounce(search);

  // Get unique groups
  const groups = React.useMemo(() => {
    const uniqueGroups = new Set(channels.map(channel => channel.group));
    return ['all', ...Array.from(uniqueGroups)].sort();
  }, [channels]);

  // Filter channels
  const filteredChannels = React.useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesGroup = selectedGroup === 'all' || channel.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [channels, debouncedSearch, selectedGroup]);

  // Setup virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredChannels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5
  });

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg text-white"
          />
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-4 py-2 bg-zinc-800 rounded-lg text-white"
        >
          {groups.map((group) => (
            <option key={group} value={group}>
              {group === 'all' ? 'Todas as categorias' : group}
            </option>
          ))}
        </select>
      </div>

      {/* Virtualized content grid */}
      <div
        ref={parentRef}
        className="h-[calc(100vh-200px)] overflow-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const channel = filteredChannels[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`
                  }}
                >
                  <ContentCard
                    channel={channel}
                    isFavorite={favorites.includes(channel.id)}
                    onToggleFavorite={() => toggleFavorite(channel.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}