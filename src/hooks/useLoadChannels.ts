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
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [backgroundLoadStarted, setBackgroundLoadStarted] = useState(false);
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
      const totalItems = movies.length + series.length + live.length;

      // Se já tiver muitos itens carregados, não carrega mais
      if (totalItems > 500) {
        console.log(`Já existem ${totalItems} itens carregados, pulando carregamento adicional`);
        setInitialLoadDone(true);
        setLoading(false);
        return;
      }

      // Se não tiver dados básicos ou o cache expirou, carrega tudo
      if (!hasBasicData || shouldRefreshCache()) {
        console.log('Iniciando carregamento completo dos canais...');
        
        try {
          // Adicionar timeout para evitar bloqueio infinito
          const syncPromise = syncFromCloud();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao sincronizar canais')), 30000) // Aumentado para 30s
          );
          
          await Promise.race([syncPromise, timeoutPromise]);
          
          // Carregar apenas as primeiras 3 páginas para garantir conteúdo suficiente
          // Reduzido de 5 para 3 para diminuir o carregamento inicial
          const pagesToLoad = 3;
          console.log(`Carregando ${pagesToLoad} páginas iniciais para garantir conteúdo suficiente...`);
          
          for (let i = 0; i < pagesToLoad; i++) {
            console.log(`Carregando página ${i + 1} de ${pagesToLoad}...`);
            await loadNextPage();
            
            // Pequena pausa para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          console.log('Carregamento inicial concluído!');
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
      setInitialLoadDone(true);
      
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar canais');
    } finally {
      setLoading(false);
    }
  }, [loading, movies.length, series.length, live.length, syncFromCloud, loadNextPage]);

  // Carrega mais conteúdo em segundo plano após o carregamento inicial
  useEffect(() => {
    let isMounted = true;
    
    const loadMoreInBackground = async () => {
      if (!initialLoadDone || loading || backgroundLoadStarted) return;
      
      // Marcar que o carregamento em segundo plano já começou para evitar duplicações
      setBackgroundLoadStarted(true);
      
      // Esperar um pouco após o carregamento inicial
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (!isMounted) return;
      
      try {
        console.log('Iniciando carregamento adicional em segundo plano...');
        
        // Reduzido de 10 para 5 páginas em segundo plano
        const additionalPages = 5;
        
        // Limitar o número total de itens
        const maxItems = 1000;
        
        for (let i = 0; i < additionalPages; i++) {
          if (!isMounted) break;
          
          // Verificar se já temos itens suficientes
          const currentTotal = movies.length + series.length + live.length;
          if (currentTotal >= maxItems) {
            console.log(`Limite de ${maxItems} itens atingido (${currentTotal}), parando carregamento`);
            break;
          }
          
          console.log(`Carregando página adicional ${i + 1} de ${additionalPages}...`);
          await loadNextPage();
          
          // Pausa maior entre carregamentos em segundo plano
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        console.log('Carregamento em segundo plano concluído!');
      } catch (error) {
        console.error('Erro no carregamento em segundo plano:', error);
      }
    };
    
    if (initialLoadDone && !backgroundLoadStarted) {
      loadMoreInBackground();
    }
    
    return () => {
      isMounted = false;
    };
  }, [initialLoadDone, loading, loadNextPage, movies.length, series.length, live.length, backgroundLoadStarted]);

  // Efeito para carregar canais na inicialização
  useEffect(() => {
    loadChannelsSafely();
  }, [loadChannelsSafely]);

  return {
    channels: [...movies, ...series, ...live],
    loading,
    error
  };
}
