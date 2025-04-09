import { useQuery } from '@tanstack/react-query';
import { contentService, ContentFilter } from '../services/content.service';

export function useContent(type: string, filter: ContentFilter = {}) {
  return useQuery({
    queryKey: ['content', type, filter],
    queryFn: () => contentService.getContent(type, filter),
    gcTime: 1000 * 60 * 30, // 30 minutos
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    onError: (error: Error) => {
      console.error(`Erro ao carregar ${type}:`, error);
    }
  });
} 