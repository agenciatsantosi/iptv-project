import React from 'react';
import { Channel } from '../../types/iptv';
import { ContentCard } from './ContentCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ContentGridProps {
  channels: Channel[];
}

export function ContentGrid({ channels }: ContentGridProps) {
  const { displayedItems, loading, hasMore } = useInfiniteScroll({
    items: channels,
    itemsPerPage: 12
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedItems.map((channel, index) => (
          <ContentCard
            key={`${channel.id}-${index}`}
            channel={channel}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      )}

      {!hasMore && channels.length > 0 && (
        <div className="text-center text-gray-400 py-8">
          Não há mais conteúdo para carregar
        </div>
      )}

      {channels.length === 0 && !loading && (
        <div className="text-center text-gray-400 py-8">
          Nenhum conteúdo encontrado
        </div>
      )}
    </div>
  );
}