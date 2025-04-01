import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  threshold?: number;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  children,
  threshold = 0.8
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, isLoadingMore, onLoadMore]
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  if (isLoading) {
    return (
      <VStack spacing={4} py={8}>
        <Spinner size="xl" color="red.500" thickness="4px" />
        <Text color="gray.500">Carregando conteúdo...</Text>
      </VStack>
    );
  }

  return (
    <Box position="relative">
      {children}
      
      {/* Loading indicator */}
      <Box ref={loadingRef} py={4}>
        {isLoadingMore && (
          <VStack spacing={2}>
            <Spinner size="md" color="red.500" thickness="3px" />
            <Text fontSize="sm" color="gray.500">
              Carregando mais...
            </Text>
          </VStack>
        )}
        
        {!hasMore && (
          <Text textAlign="center" color="gray.500" fontSize="sm" py={4}>
            Não há mais conteúdo para carregar
          </Text>
        )}
      </Box>
    </Box>
  );
}
