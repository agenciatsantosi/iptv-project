import { useState, useEffect, useCallback, useRef } from 'react';
import { Channel } from '../types/iptv';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 100; 
const CACHE_KEY = 'channels_cache';
const CACHE_EXPIRY = 1000 * 60 * 60; 

interface CacheData {
  timestamp: number;
  channels: Channel[];
  type: string;
  hasMore: boolean;
  total: number;
}

interface UseInfiniteChannelsReturn {
  channels: Channel[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  total: number;
}

function extractSeriesInfo(title: string) {
  let cleanTitle = title
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/\s*\[[^\]]*\]\s*/g, '')
    .trim();

  const patterns = [
    /^(.*?)\s*[Ss](?:0*)(\d{1,2})\s*[Ee](?:0*)(\d{1,2})/,  
    /^(.*?)\s*(?:0*)(\d{1,2})x(?:0*)(\d{1,2})/,            
    /^(.*?)\s*[Ee]pis[oó]dio\s*(?:0*)(\d{1,2})/i,          
    /^(.*?)\s*[Ee][Pp]\s*(?:0*)(\d{1,2})/i,                
    /^(.*?)\s*[Cc]ap[ií]tulo\s*(?:0*)(\d{1,2})/i,          
    /^(.*?)\s*[Tt](?:0*)(\d{1,2})\s*[Ee](?:0*)(\d{1,2})/   
  ];

  for (const pattern of patterns) {
    const match = cleanTitle.match(pattern);
    if (match) {
      const seriesName = match[1].trim();
      const seasonNumber = match[2] ? parseInt(match[2]) : 1;
      const episodeNumber = match[3] ? parseInt(match[3]) : parseInt(match[2]);
      
      return {
        seriesName,
        seasonNumber,
        episodeNumber
      };
    }
  }

  return {
    seriesName: cleanTitle,
    seasonNumber: 1,
    episodeNumber: 1
  };
}

function generateSeriesId(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/[^\w-]+/g, '');
}

function groupSeries(channels: Channel[]): Channel[] {
  if (!channels?.length) return [];

  const seriesMap = new Map<string, Channel>();

  channels.forEach(channel => {
    if (!channel.name) return;

    const { seriesName } = extractSeriesInfo(channel.name);
    const seriesId = generateSeriesId(seriesName);
    
    if (!seriesMap.has(seriesId)) {
      seriesMap.set(seriesId, {
        ...channel,
        id: seriesId,
        name: seriesName,
        episodes: [channel],
        group_title: channel.group_title,
        thumbnailPath: channel.tvg?.logo || channel.logo || channel.thumbnailPath
      });
    } else {
      const existingSeries = seriesMap.get(seriesId)!;
      if (!existingSeries.episodes?.some(ep => ep.id === channel.id)) {
        existingSeries.episodes = [...(existingSeries.episodes || []), channel];
        
        if (!existingSeries.thumbnailPath && (channel.tvg?.logo || channel.logo || channel.thumbnailPath)) {
          existingSeries.thumbnailPath = channel.tvg?.logo || channel.logo || channel.thumbnailPath;
        }
      }
    }
  });

  seriesMap.forEach(series => {
    if (series.episodes) {
      series.episodes.sort((a, b) => {
        const infoA = extractSeriesInfo(a.name);
        const infoB = extractSeriesInfo(b.name);
        if (infoA.seasonNumber === infoB.seasonNumber) {
          return infoA.episodeNumber - infoB.episodeNumber;
        }
        return infoA.seasonNumber - infoB.seasonNumber;
      });
    }
  });

  return Array.from(seriesMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function useInfiniteChannels(type: 'live' | 'movie' | 'series'): UseInfiniteChannelsReturn {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const initialized = useRef(false);
  const currentType = useRef(type);
  const isFetching = useRef(false);

  const fetchChannels = useCallback(async (pageNumber: number) => {
    try {
      const start = pageNumber * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      console.log('Fetching channels:', { type, start, end });

      const { data, error, count } = await supabase
        .from('channels')
        .select('*', { count: 'exact' })
        .eq('type', type)
        .order('name')
        .range(start, end);

      if (error) {
        console.error('Error fetching channels:', error);
        throw error;
      }

      console.log('Fetched channels:', { 
        count, 
        dataLength: data?.length,
        firstItem: data?.[0],
        lastItem: data?.[data?.length - 1] 
      });

      if (count !== null) {
        setTotal(count);
        setHasMore(start + PAGE_SIZE < count);
      }

      if (type === 'series') {
        const grouped = groupSeries(data || []);
        console.log('Grouped series:', { 
          originalCount: data?.length,
          groupedCount: grouped.length,
          firstGroup: grouped[0]
        });
        return grouped;
      }

      return data || [];
    } catch (error) {
      console.error('Error loading channels:', error);
      throw error;
    }
  }, [type]);

  const loadMore = useCallback(async () => {
    if (isFetching.current || !hasMore) return;

    try {
      setIsLoadingMore(true);
      isFetching.current = true;
      const nextPage = page + 1;
      const newChannels = await fetchChannels(nextPage);
      
      setChannels(prevChannels => {
        if (type === 'series') {
          return groupSeries([...prevChannels, ...newChannels]);
        }
        return [...prevChannels, ...newChannels];
      });
      
      setPage(nextPage);
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoadingMore(false);
      isFetching.current = false;
    }
  }, [fetchChannels, hasMore, page, type]);

  useEffect(() => {
    const loadInitialChannels = async () => {
      if (initialized.current && currentType.current === type) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const initialChannels = await fetchChannels(0);
        setChannels(initialChannels);
        setPage(0);
        initialized.current = true;
        currentType.current = type;
      } catch (error: any) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialChannels();
  }, [fetchChannels, type]);

  return {
    channels,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    total
  };
}
