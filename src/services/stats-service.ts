import { supabase } from '../lib/supabase';

export interface DatabaseStats {
  total: number;
  movies: number;
  series: number;
  live: number;
}

export interface SystemStats {
  loaded: {
    total: number;
    movies: number;
    series: number;
    live: number;
  };
  database: DatabaseStats;
  loadPercentage: {
    total: number;
    movies: number;
    series: number;
    live: number;
  };
}

/**
 * Busca estatísticas completas do banco de dados e do sistema
 */
export async function getSystemStats(): Promise<SystemStats> {
  try {
    console.log('Iniciando coleta de estatísticas do sistema...');
    
    // Buscar contagem total de registros
    const { count: totalCount, error: totalError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Erro ao buscar contagem total:', totalError);
      throw totalError;
    }
    
    console.log('Total de registros no banco:', totalCount);

    // Buscar contagem de filmes
    const { count: moviesCount, error: moviesError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'movie');

    if (moviesError) {
      console.error('Erro ao buscar contagem de filmes:', moviesError);
      throw moviesError;
    }
    
    console.log('Total de filmes no banco:', moviesCount);

    // Buscar contagem de séries
    const { count: seriesCount, error: seriesError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'series');

    if (seriesError) {
      console.error('Erro ao buscar contagem de séries:', seriesError);
      throw seriesError;
    }
    
    console.log('Total de séries no banco:', seriesCount);

    // Buscar contagem de canais ao vivo
    const { count: liveCount, error: liveError } = await supabase
      .from('channels')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'live');

    if (liveError) {
      console.error('Erro ao buscar contagem de canais ao vivo:', liveError);
      throw liveError;
    }
    
    console.log('Total de canais ao vivo no banco:', liveCount);

    // Obter estado atual do sistema (via localStorage)
    console.log('Buscando dados do localStorage...');
    const storageData = localStorage.getItem('iptv-storage');
    let loadedMovies = 0;
    let loadedSeries = 0;
    let loadedLive = 0;

    if (storageData) {
      try {
        console.log('Dados encontrados no localStorage, analisando...');
        const parsedData = JSON.parse(storageData);
        console.log('Estrutura dos dados armazenados:', Object.keys(parsedData));
        
        if (parsedData.state) {
          console.log('Estado encontrado, verificando arrays de conteúdo...');
          console.log('Chaves do estado:', Object.keys(parsedData.state));
          
          // Verificar se os arrays existem e são realmente arrays
          if (Array.isArray(parsedData.state.movies)) {
            loadedMovies = parsedData.state.movies.length;
            console.log(`Array de filmes encontrado com ${loadedMovies} itens`);
          } else {
            console.warn('O campo movies não é um array ou não existe:', parsedData.state.movies);
          }
          
          if (Array.isArray(parsedData.state.series)) {
            loadedSeries = parsedData.state.series.length;
            console.log(`Array de séries encontrado com ${loadedSeries} itens`);
          } else {
            console.warn('O campo series não é um array ou não existe:', parsedData.state.series);
          }
          
          if (Array.isArray(parsedData.state.live)) {
            loadedLive = parsedData.state.live.length;
            console.log(`Array de canais ao vivo encontrado com ${loadedLive} itens`);
          } else {
            console.warn('O campo live não é um array ou não existe:', parsedData.state.live);
          }
        } else {
          console.warn('Nenhum estado encontrado nos dados armazenados');
        }
      } catch (e) {
        console.error('Erro ao analisar dados do localStorage:', e);
      }
    } else {
      console.warn('Nenhum dado encontrado no localStorage para iptv-storage');
      
      // Tentar obter diretamente do store (alternativa)
      try {
        console.log('Tentando obter dados diretamente do store...');
        // Não podemos usar hooks fora de componentes React, então vamos usar uma abordagem alternativa
        // Verificar se há uma variável global com o estado
        const globalState = (window as any).__IPTV_STORE_STATE__;
        if (globalState) {
          console.log('Estado global encontrado:', globalState);
          loadedMovies = Array.isArray(globalState.movies) ? globalState.movies.length : 0;
          loadedSeries = Array.isArray(globalState.series) ? globalState.series.length : 0;
          loadedLive = Array.isArray(globalState.live) ? globalState.live.length : 0;
        }
      } catch (e) {
        console.error('Erro ao tentar acessar estado global:', e);
      }
    }

    const loadedTotal = loadedMovies + loadedSeries + loadedLive;
    const databaseTotal = totalCount || 0;
    
    console.log('Resumo dos dados carregados:', {
      loadedMovies,
      loadedSeries,
      loadedLive,
      loadedTotal,
      databaseTotal
    });

    // Calcular percentuais de carregamento
    const calculatePercentage = (loaded: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((loaded / total) * 100);
    };

    return {
      loaded: {
        total: loadedTotal,
        movies: loadedMovies,
        series: loadedSeries,
        live: loadedLive
      },
      database: {
        total: databaseTotal,
        movies: moviesCount || 0,
        series: seriesCount || 0,
        live: liveCount || 0
      },
      loadPercentage: {
        total: calculatePercentage(loadedTotal, databaseTotal),
        movies: calculatePercentage(loadedMovies, moviesCount || 0),
        series: calculatePercentage(loadedSeries, seriesCount || 0),
        live: calculatePercentage(loadedLive, liveCount || 0)
      }
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    return {
      loaded: { total: 0, movies: 0, series: 0, live: 0 },
      database: { total: 0, movies: 0, series: 0, live: 0 },
      loadPercentage: { total: 0, movies: 0, series: 0, live: 0 }
    };
  }
}
