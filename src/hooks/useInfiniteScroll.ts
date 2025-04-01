import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage?: number;
}

export function useInfiniteScroll<T>({
  items,
  itemsPerPage = 12
}: UseInfiniteScrollProps<T>) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);

  // Calcula se há mais itens para carregar
  const hasMore = displayedItems.length < items.length;

  // Carrega os itens iniciais
  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage));
  }, [items, itemsPerPage]);

  // Função para carregar mais itens
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    setTimeout(() => {
      const nextItems = items.slice(0, (page + 1) * itemsPerPage);
      setDisplayedItems(nextItems);
      setPage(prev => prev + 1);
      setLoading(false);
    }, 500);
  }, [items, page, itemsPerPage, loading, hasMore]);

  // Adiciona o event listener de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return {
    displayedItems,
    loading,
    hasMore,
    loadMore
  };
}