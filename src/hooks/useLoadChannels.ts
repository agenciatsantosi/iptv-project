import { useState, useEffect, useCallback } from 'react';
import { useIPTVStore } from '../store/iptvStore';

const CACHE_KEY = 'channels_cache_v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

interface CacheData {
  timestamp: number;
  lastSync: number;
}

function shouldRefreshCache(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return true;

    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Verifica se o cache expirou (24 horas)
    return (now - cacheData.timestamp > CACHE_DURATION);
  } catch (error) {
    console.error('Erro ao verificar cache:', error);
    return true;
  }
}

function updateCache() {
  try {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      lastSync: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erro ao atualizar cache:', error);
  }
}

export function useLoadChannels() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    movies,
    series,
    live,
    syncFromCloud,
    loadNextPage
  } = useIPTVStore();

  // Função para carregar canais de forma segura
  const loadChannelsSafely = useCallback(async () => {
    if (loading) return;

    try {
      console.log('Iniciando carregamento dos canais...');
      setLoading(true);
      setError(null);

      // Verifica se tem dados básicos carregados
      const hasBasicData = movies.length > 0 || series.length > 0 || live.length > 0;

      // Se não tiver dados básicos ou o cache expirou, carrega tudo
      if (!hasBasicData || shouldRefreshCache()) {
        console.log('Iniciando carregamento completo dos canais...');
        
        try {
          // Adicionar timeout para evitar bloqueio infinito
          const syncPromise = syncFromCloud();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao sincronizar canais')), 15000)
          );
          
          await Promise.race([syncPromise, timeoutPromise]);
          
          // Se ainda não temos canais após a sincronização, tenta carregar a próxima página
          if (movies.length === 0 && series.length === 0 && live.length === 0) {
            console.log('Tentando carregar próxima página...');
            await loadNextPage();
          }
        } catch (syncError) {
          console.error('Erro durante sincronização:', syncError);
          setError(syncError instanceof Error ? syncError.message : 'Erro ao carregar canais');
          // Mesmo com erro, continuamos para permitir que a UI seja renderizada
        }
      } else {
        console.log('Usando dados em cache:', { 
          movies: movies.length, 
          series: series.length, 
          live: live.length 
        });
      }
      
      // Atualizar cache mesmo se houver erro parcial
      updateCache();
      
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar canais');
    } finally {
      setLoading(false);
    }
  }, [loading, movies, series, live, syncFromCloud, loadNextPage]);

  useEffect(() => {
    loadChannelsSafely();
  }, [loadChannelsSafely]);

  return {
    channels: [...movies, ...series, ...live],
    loading,
    error
  };
}
