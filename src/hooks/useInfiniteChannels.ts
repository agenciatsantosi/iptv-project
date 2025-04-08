import { useState, useEffect, useCallback, useRef } from 'react';
import { Channel } from '../types/iptv';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 50; 
const CACHE_KEY = 'channels_cache_v3'; 
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; 

interface CacheData {
  timestamp: number;
  channels: Channel[];
  type: string;
  hasMore: boolean;
  total: number;
  page: number;
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

function getFromCache(type: string): CacheData | null {
  try {
    const cacheKey = `${CACHE_KEY}_${type}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - cacheData.timestamp > CACHE_EXPIRY) {
      console.log('Cache expirado para', type);
      return null;
    }
    
    console.log('Usando cache para', type, {
      channels: cacheData.channels.length,
      page: cacheData.page,
      total: cacheData.total
    });
    
    return cacheData;
  } catch (error) {
    console.error('Erro ao ler cache:', error);
    return null;
  }
}

function saveToCache(type: string, data: CacheData): void {
  try {
    const cacheKey = `${CACHE_KEY}_${type}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
    console.log('Cache atualizado para', type, {
      channels: data.channels.length,
      page: data.page
    });
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
}

function extractSeriesInfo(title: string) {
  if (!title) return { seriesName: 'Desconhecido', seasonNumber: 1, episodeNumber: 1 };
  
  // Limpar o título primeiro
  let cleanTitle = title
    .replace(/\s*\([^)]*\)\s*/g, '')  // Remove conteúdo entre parênteses
    .replace(/\s*\[[^\]]*\]\s*/g, '')  // Remove conteúdo entre colchetes
    .replace(/\s*-\s*$/, '')           // Remove traços no final
    .replace(/\s+/g, ' ')              // Normaliza espaços
    .trim();

  // Padrões para identificar séries com temporada e episódio
  const patterns = [
    // S01E01 ou S1E1 - formato padrão
    /^(.*?)\s*[Ss](?:0*)(\d{1,2})\s*[Ee](?:0*)(\d{1,2})/,
    
    // 01x01 - formato alternativo
    /^(.*?)\s*(?:0*)(\d{1,2})x(?:0*)(\d{1,2})/,
    
    // Episódio 01 - formato em português
    /^(.*?)\s*[Ee]pis[oó]dio\s*(?:0*)(\d{1,2})/i,
    
    // EP 01 - abreviação
    /^(.*?)\s*[Ee][Pp]\s*(?:0*)(\d{1,2})/i,
    
    // Capítulo 01 - formato novela/série
    /^(.*?)\s*[Cc]ap[ií]tulo\s*(?:0*)(\d{1,2})/i,
    
    // T01E01 - formato alternativo
    /^(.*?)\s*[Tt](?:0*)(\d{1,2})\s*[Ee](?:0*)(\d{1,2})/,
    
    // Temporada 1 Episódio 1 - formato extenso
    /^(.*?)\s*[Tt]emporada\s*(\d{1,2})(?:\s*[Ee]pis[oó]dio\s*|\s*[Ee][Pp]\s*)(\d{1,2})/i
  ];

  // Tentar encontrar um padrão que corresponda
  for (const pattern of patterns) {
    const match = cleanTitle.match(pattern);
    if (match) {
      // Extrair nome da série e números de temporada/episódio
      let seriesName = match[1].trim();
      
      // Limpar o nome da série
      seriesName = seriesName
        .replace(/\s*-\s*$/, '')  // Remove traços no final
        .replace(/\s+/g, ' ')     // Normaliza espaços
        .trim();
      
      const seasonNumber = match[2] ? parseInt(match[2]) : 1;
      const episodeNumber = match[3] ? parseInt(match[3]) : parseInt(match[2]);
      
      return {
        seriesName,
        seasonNumber,
        episodeNumber
      };
    }
  }

  // Se não encontrou padrão, assumir que é o primeiro episódio da primeira temporada
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
  
  // Primeiro passo: identificar todas as séries únicas
  channels.forEach(channel => {
    if (!channel.name) return;

    const { seriesName } = extractSeriesInfo(channel.name);
    // Limpar o nome da série para melhorar o agrupamento
    const cleanSeriesName = seriesName
      .replace(/\s*-\s*$/, '')  // Remove traços no final
      .replace(/\s+/g, ' ')     // Normaliza espaços
      .trim();
      
    const seriesId = generateSeriesId(cleanSeriesName);
    
    if (!seriesMap.has(seriesId)) {
      // Criar uma nova entrada para esta série
      seriesMap.set(seriesId, {
        ...channel,
        id: seriesId,
        name: cleanSeriesName,
        episodes: [channel],
        episodeCount: 1,
        group_title: channel.group_title,
        thumbnailPath: channel.tvg?.logo || channel.logo || channel.thumbnailPath
      });
    } else {
      // Adicionar este episódio à série existente
      const existingSeries = seriesMap.get(seriesId)!;
      
      // Verificar se este episódio já existe na lista
      if (!existingSeries.episodes?.some(ep => ep.id === channel.id)) {
        // Adicionar episódio
        existingSeries.episodes = [...(existingSeries.episodes || []), channel];
        existingSeries.episodeCount = (existingSeries.episodeCount || 0) + 1;
        
        // Atualizar thumbnail se necessário
        if (!existingSeries.thumbnailPath && (channel.tvg?.logo || channel.logo || channel.thumbnailPath)) {
          existingSeries.thumbnailPath = channel.tvg?.logo || channel.logo || channel.thumbnailPath;
        }
      }
    }
  });

  // Segundo passo: ordenar episódios dentro de cada série
  seriesMap.forEach(series => {
    if (series.episodes) {
      series.episodes.sort((a, b) => {
        const infoA = extractSeriesInfo(a.name);
        const infoB = extractSeriesInfo(b.name);
        
        // Primeiro ordenar por temporada
        if (infoA.seasonNumber !== infoB.seasonNumber) {
          return infoA.seasonNumber - infoB.seasonNumber;
        }
        
        // Depois por episódio
        return infoA.episodeNumber - infoB.episodeNumber;
      });
      
      // Adicionar informação sobre o último episódio
      if (series.episodes.length > 0) {
        const lastEpisode = series.episodes[series.episodes.length - 1];
        const info = extractSeriesInfo(lastEpisode.name);
        series.latestEpisode = `S${info.seasonNumber.toString().padStart(2, '0')}E${info.episodeNumber.toString().padStart(2, '0')}`;
      }
    }
  });

  // Retornar séries ordenadas por nome
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
  const maxItemsRef = useRef(1000); 

  const fetchChannels = useCallback(async (pageNumber: number) => {
    try {
      const start = pageNumber * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      console.log('Fetching channels:', { type, start, end });

      // Consulta especial para canais do tipo 'live'
      if (type === 'live') {
        // Buscar todos os canais do tipo 'live', sem filtros adicionais
        const { data, error, count } = await supabase
          .from('channels')
          .select('*', { count: 'exact' })
          .eq('type', 'live')
          .order('name')
          .range(start, end);

        if (error) {
          console.error('Error fetching live channels:', error);
          throw error;
        }

        console.log('Fetched live channels:', { 
          count, 
          dataLength: data?.length,
          firstItem: data?.[0]?.name,
          lastItem: data?.[data?.length - 1]?.name 
        });

        if (count !== null) {
          setTotal(count);
          setHasMore(start + PAGE_SIZE < count && channels.length < maxItemsRef.current);
        }

        return data || [];
      }
      
      // Consulta normal para outros tipos (movies e series)
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
        firstItem: data?.[0]?.name,
        lastItem: data?.[data?.length - 1]?.name 
      });

      if (count !== null) {
        setTotal(count);
        setHasMore(start + PAGE_SIZE < count && channels.length < maxItemsRef.current);
      }

      if (type === 'series') {
        // Agrupar séries por nome base
        const grouped = groupSeries(data || []);
        
        // Verificar se já temos séries carregadas
        if (channels.length > 0 && pageNumber > 0) {
          // Filtrar apenas séries que ainda não estão na lista
          const existingSeriesIds = new Set(channels.map(series => series.id));
          const newSeries = grouped.filter(series => !existingSeriesIds.has(series.id));
          
          console.log('Novas séries encontradas:', newSeries.length);
          
          return newSeries;
        }
        
        console.log('Grouped series:', { 
          originalCount: data?.length,
          groupedCount: grouped.length,
          firstGroup: grouped[0]?.name
        });
        
        return grouped;
      }

      return data || [];
    } catch (error) {
      console.error('Error loading channels:', error);
      throw error;
    }
  }, [type, channels.length]);

  const loadMore = useCallback(async () => {
    if (isFetching.current || !hasMore || channels.length >= maxItemsRef.current) {
      console.log('Ignorando loadMore:', {
        isFetching: isFetching.current,
        hasMore,
        channelsLength: channels.length,
        maxItems: maxItemsRef.current
      });
      return;
    }

    try {
      setIsLoadingMore(true);
      isFetching.current = true;
      const nextPage = page + 1;
      const newChannels = await fetchChannels(nextPage);
      
      setChannels(prevChannels => {
        // Para séries, garantir que não haja duplicatas
        const updatedChannels = type === 'series'
          ? [...prevChannels, ...newChannels].filter((channel, index, self) => 
              index === self.findIndex(c => c.id === channel.id)
            )
          : [...prevChannels, ...newChannels];
          
        // Atualizar cache
        saveToCache(type, {
          channels: updatedChannels,
          type,
          hasMore,
          total,
          page: nextPage,
          timestamp: Date.now()
        });
        
        return updatedChannels;
      });
      
      setPage(nextPage);
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoadingMore(false);
      isFetching.current = false;
    }
  }, [fetchChannels, hasMore, page, type, channels.length, total]);

  useEffect(() => {
    const loadInitialChannels = async () => {
      if (initialized.current && currentType.current === type) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const cachedData = getFromCache(type);
        
        if (cachedData) {
          setChannels(cachedData.channels);
          setPage(cachedData.page);
          setTotal(cachedData.total);
          setHasMore(cachedData.hasMore && cachedData.channels.length < maxItemsRef.current);
          initialized.current = true;
          currentType.current = type;
          setIsLoading(false);
          return;
        }
        
        const initialChannels = await fetchChannels(0);
        setChannels(initialChannels);
        setPage(0);
        
        saveToCache(type, {
          channels: initialChannels,
          type,
          hasMore,
          total,
          page: 0,
          timestamp: Date.now()
        });
        
        initialized.current = true;
        currentType.current = type;
      } catch (error: any) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialChannels();
  }, [fetchChannels, type, hasMore, total]);

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
