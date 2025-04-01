import React from 'react';
import { Channel } from '../../types/iptv';
import { ChannelCard } from './ChannelCard';
import { Search } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  favorites: string[];
  onToggleFavorite: (channelId: string) => void;
}

export function ChannelList({ channels, favorites, onToggleFavorite }: ChannelListProps) {
  const [search, setSearch] = React.useState('');
  const [selectedGroup, setSelectedGroup] = React.useState<string>('all');

  // Obtém grupos únicos
  const groups = ['all', ...new Set(channels.map((channel) => channel.group))];

  // Filtra canais
  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || channel.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar canais..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg text-white"
        />
      </div>

      {/* Seletor de grupos */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={\`px-4 py-2 rounded-full whitespace-nowrap \${
              selectedGroup === group
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
            }\`}
          >
            {group === 'all' ? 'Todos' : group}
          </button>
        ))}
      </div>

      {/* Lista de canais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isFavorite={favorites.includes(channel.id)}
            onToggleFavorite={() => onToggleFavorite(channel.id)}
          />
        ))}
      </div>
    </div>
  );
}