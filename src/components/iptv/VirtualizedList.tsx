import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Channel } from '../../types/iptv';
import { ContentCard } from './ContentCard';

interface VirtualizedListProps {
  items: Channel[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export function VirtualizedList({ items, favorites, onToggleFavorite }: VirtualizedListProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5
  });

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-200px)] overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <ContentCard
                channel={item}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={() => onToggleFavorite(item.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}