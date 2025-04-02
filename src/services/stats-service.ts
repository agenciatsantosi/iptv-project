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
        
        // Verificar diferentes estruturas possíveis do localStorage
        // Estrutura 1: state contém diretamente os arrays
        if (parsedData.state && typeof parsedData.state === 'object') {
          console.log('Estado encontrado, verificando arrays de conteúdo...');
          console.log('Chaves do estado:', Object.keys(parsedData.state));
          
          // Verificar se os arrays existem e são realmente arrays
          if (Array.isArray(parsedData.state.movies)) {
            loadedMovies = parsedData.state.movies.length;
            console.log(`Array de filmes encontrado com ${loadedMovies} itens`);
          } 
          
          if (Array.isArray(parsedData.state.series)) {
            loadedSeries = parsedData.state.series.length;
            console.log(`Array de séries encontrado com ${loadedSeries} itens`);
          }
          
          if (Array.isArray(parsedData.state.live)) {
            loadedLive = parsedData.state.live.length;
            console.log(`Array de canais ao vivo encontrado com ${loadedLive} itens`);
          }
        }
        
        // Se não encontrou os arrays no formato esperado, tenta outros formatos
        if (loadedMovies === 0 && loadedSeries === 0 && loadedLive === 0) {
          // Tentar encontrar em outras estruturas possíveis
          console.log('Tentando estruturas alternativas...');
          
          // Verificar se existe uma propriedade que contém os arrays
          const stateKeys = Object.keys(parsedData.state || {});
          for (const key of stateKeys) {
            const stateValue = parsedData.state[key];
            
            // Procurar por propriedades que podem conter os arrays
            if (typeof stateValue === 'object' && stateValue !== null) {
              if (Array.isArray(stateValue.movies)) {
                loadedMovies = stateValue.movies.length;
                console.log(`Array de filmes encontrado em ${key} com ${loadedMovies} itens`);
              }
              
              if (Array.isArray(stateValue.series)) {
                loadedSeries = stateValue.series.length;
                console.log(`Array de séries encontrado em ${key} com ${loadedSeries} itens`);
              }
              
              if (Array.isArray(stateValue.live)) {
                loadedLive = stateValue.live.length;
                console.log(`Array de canais ao vivo encontrado em ${key} com ${loadedLive} itens`);
              }
            }
          }
        }
        
        // Verificar se existe um contador de itens em vez dos arrays completos
        if (loadedMovies === 0 && typeof parsedData.state?.totalMovies === 'number') {
          loadedMovies = parsedData.state.totalMovies;
          console.log(`Contador de filmes encontrado: ${loadedMovies}`);
        }
        
        if (loadedSeries === 0 && typeof parsedData.state?.totalSeries === 'number') {
          loadedSeries = parsedData.state.totalSeries;
          console.log(`Contador de séries encontrado: ${loadedSeries}`);
        }
        
        if (loadedLive === 0 && typeof parsedData.state?.totalLive === 'number') {
          loadedLive = parsedData.state.totalLive;
          console.log(`Contador de canais ao vivo encontrado: ${loadedLive}`);
        }
      } catch (e) {
        console.error('Erro ao analisar dados do localStorage:', e);
      }
    } else {
      console.warn('Nenhum dado encontrado no localStorage para iptv-storage');
    }
    
    // Se não conseguiu obter do localStorage, tenta obter do sessionStorage
    if (loadedMovies === 0 && loadedSeries === 0 && loadedLive === 0) {
      try {
        console.log('Tentando obter dados do sessionStorage...');
        const sessionData = sessionStorage.getItem('iptv-session-stats');
        
        if (sessionData) {
          const sessionStats = JSON.parse(sessionData);
          loadedMovies = sessionStats.movies || 0;
          loadedSeries = sessionStats.series || 0;
          loadedLive = sessionStats.live || 0;
          console.log('Dados obtidos do sessionStorage:', { loadedMovies, loadedSeries, loadedLive });
        }
      } catch (e) {
        console.error('Erro ao obter dados do sessionStorage:', e);
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
