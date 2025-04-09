import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services/content.service';

interface ContentFilter {
  page?: number;
  limit?: number;
  category?: string;
}

export function useContent(type: 'movies' | 'series' | 'live', filter?: ContentFilter) {
  return useQuery({
    queryKey: ['content', type, filter],
    queryFn: () => contentService.getContent(type, filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: Error) => {
      console.error(`Error fetching ${type} content:`, error);
    }
  });
}

export function useChannel(id?: string) {
  return useQuery({
    queryKey: ['channel', id],
    queryFn: () => contentService.getChannelById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: Error) => {
      console.error('Error fetching channel:', error);
    }
  });
} 