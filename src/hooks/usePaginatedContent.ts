import { useState, useEffect, useMemo } from 'react';
import { Channel } from '../types/iptv';

const ITEMS_PER_PAGE = 20;

export function usePaginatedContent(items: Channel[] = []) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Usar useMemo para evitar recálculos desnecessários
  const displayedItems = useMemo(() => {
    const endIndex = page * ITEMS_PER_PAGE;
    const newItems = items.slice(0, endIndex);
    return newItems;
  }, [items, page]);

  // Atualizar hasMore quando items ou page mudam
  useEffect(() => {
    const endIndex = page * ITEMS_PER_PAGE;
    setHasMore(endIndex < items.length);
  }, [items, page]);

  // Resetar paginação quando items mudam
  useEffect(() => {
    setPage(1);
  }, [items]);

  const loadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return {
    displayedItems,
    hasMore,
    loadMore,
    resetPagination: () => setPage(1)
  };
}
