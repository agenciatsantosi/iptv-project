import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { useWatchHistory } from '../../hooks/useWatchHistory';
import { IPTVChannelCard } from './IPTVChannelCard';
import { useIPTVStore } from '../../store/iptvStore';

export function IPTVHistory() {
  const { history, clearHistory } = useWatchHistory();
  const { favorites, toggleFavorite } = useIPTVStore();

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
        <p className="text-gray-400">Nenhum canal assistido recentemente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Histórico</h2>
        <button
          onClick={clearHistory}
          className="flex items-center text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar histórico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map(({ channel }) => (
          <IPTVChannelCard
            key={channel.id}
            channel={channel}
            isFavorite={favorites.includes(channel.id)}
            onToggleFavorite={() => toggleFavorite(channel.id)}
          />
        ))}
      </div>
    </div>
  );
}