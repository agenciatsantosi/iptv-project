import { useState, useEffect, useRef } from 'react';
import { TMDBMovie, TMDBSeries } from '../types/tmdb';
import { TMDBService } from '../lib/tmdb';

// Cache para armazenar resultados das buscas
const searchCache = new Map<string, {
  data: TMDBMovie | TMDBSeries | null;
  timestamp: number;
}>();

// Tempo de expiração do cache em milissegundos (24 horas)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Tempo de debounce em milissegundos
const DEBOUNCE_DELAY = 1000;

export function useTMDB(title: string, type: 'movie' | 'tv') {
  const [data, setData] = useState<TMDBMovie | TMDBSeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Se não tiver título, retorna imediatamente
    if (!title) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTMDBData = async () => {
      // Gera uma chave única para o cache
      const cacheKey = `${type}:${title}`;

      try {
        // Verifica se tem no cache e se não expirou
        const cached = searchCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION) {
          setData(cached.data);
          setLoading(false);
          return;
        }

        // Se não estiver no cache ou expirou, faz a busca
        let result = null;
        
        if (type === 'movie') {
          result = await TMDBService.searchMovie(title);
        } else {
          result = await TMDBService.searchSeries(title);
        }

        // Atualiza o cache
        searchCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        setData(result);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados do TMDB:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    // Limpa o timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Define loading como true apenas se não tivermos dados em cache
    const cacheKey = `${type}:${title}`;
    const cached = searchCache.get(cacheKey);
    if (!cached || Date.now() - cached.timestamp >= CACHE_EXPIRATION) {
      setLoading(true);
    }

    // Aplica debounce na busca
    timeoutRef.current = setTimeout(fetchTMDBData, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [title, type]);

  return { data, loading, error };
}