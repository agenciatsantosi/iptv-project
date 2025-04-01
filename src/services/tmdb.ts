import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Cache para evitar requisições repetidas
const imageCache = new Map<string, string>();

console.log('TMDB API Key:', TMDB_API_KEY ? 'Configurada' : 'Não configurada');

interface MovieSearchResult {
  id: number;
  title: string;
  originalTitle: string;
  year: string | undefined;
}

interface MovieDetails {
  id: number;
  title: string;
  originalTitle: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  runtime: number | null;
  voteAverage: number | null;
  genres: string[];
}

export async function searchMovie(title: string): Promise<MovieSearchResult | null> {
  try {
    console.log('Buscando filme:', {
      original: title,
      limpo: title
    });

    // Remove o ano e limpa o título
    const cleanTitle = title
      .replace(/\(\d{4}\)/, '') // Remove ano entre parênteses
      .replace(/\s*-\s*\d{4}/, '') // Remove ano após hífen
      .replace(/\s*\d{4}\s*$/, '') // Remove ano no final
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();

    // Tenta buscar primeiro com o título completo
    const searchUrl = `${TMDB_API_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=pt-BR`;
    console.log('URL da busca:', searchUrl.replace(TMDB_API_KEY, '[API_KEY]'));
    
    const response = await axios.get(searchUrl);
    const results = response.data.results || [];

    // Se não encontrou resultados, tenta buscar com palavras-chave
    if (results.length === 0) {
      // Extrai palavras-chave (números e palavras significativas)
      const keywords = cleanTitle
        .match(/(\d+|[A-Za-zÀ-ÿ]{3,})/g)
        ?.filter(word => !['contra', 'para', 'com', 'the', 'and', 'or'].includes(word.toLowerCase()))
        ?.join(' ');

      if (keywords) {
        console.log('Tentando busca alternativa com palavras-chave:', keywords);
        const keywordSearchUrl = `${TMDB_API_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(keywords)}&language=pt-BR`;
        const keywordResponse = await axios.get(keywordSearchUrl);
        const keywordResults = keywordResponse.data.results || [];
        
        if (keywordResults.length > 0) {
          results.push(...keywordResults);
        }
      }
    }

    console.log('Resultados filme:', {
      total: results.length,
      primeiro: results[0],
      todosResultados: results
    });

    if (results.length === 0) {
      return null;
    }

    // Pega o primeiro resultado
    const movie = results[0];
    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      year: movie.release_date ? movie.release_date.substring(0, 4) : undefined
    };

  } catch (error) {
    console.error('Erro ao buscar filme:', error);
    return null;
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails | null> {
  try {
    const url = `${TMDB_API_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`;
    console.log('URL dos detalhes:', url.replace(TMDB_API_KEY, '[API_KEY]'));
    
    const response = await axios.get(url);
    const movie = response.data;

    console.log('Detalhes do filme:', {
      id: movie.id,
      title: movie.title,
      hasOverview: !!movie.overview,
      hasPoster: !!movie.poster_path,
      hasBackdrop: !!movie.backdrop_path
    });

    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date,
      runtime: movie.runtime,
      voteAverage: movie.vote_average,
      genres: movie.genres?.map(g => g.name) || []
    };

  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
}

// Função para pré-carregar imagens em batch
export async function preloadImages(titles: string[], type: 'movie' | 'tv' = 'movie'): Promise<void> {
  const batchSize = 5;
  const batches = [];

  // Dividir títulos em lotes
  for (let i = 0; i < titles.length; i += batchSize) {
    batches.push(titles.slice(i, i + batchSize));
  }

  // Processar cada lote
  for (const batch of batches) {
    await Promise.all(
      batch.map(title => getMediaImage(title, type))
    );
    // Pequena pausa entre lotes para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

interface TMDBSearchResult {
  results: Array<{
    poster_path: string | null;
    backdrop_path: string | null;
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
  }>;
}

export async function getMediaImage(title: string, type: 'movie' | 'tv' = 'movie'): Promise<string | null> {
  try {
    // Verificar cache primeiro
    const cacheKey = `${type}:${title}`;
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey) || null;
    }

    // Limpar o título para melhor correspondência
    const cleanTitle = title
      .replace(/\([^)]*\)/g, '') // Remove conteúdo entre parênteses
      .replace(/:\s.*$/, '') // Remove tudo após dois pontos
      .replace(/[-–]\s.*$/, '') // Remove tudo após hífen
      .trim();

    const response = await axios.get<TMDBSearchResult>(`${TMDB_API_BASE}/search/${type}`, {
      params: {
        api_key: TMDB_API_KEY,
        query: cleanTitle,
        language: 'pt-BR',
      },
    });

    const results = response.data.results;
    if (!results.length) return null;

    // Encontrar a melhor correspondência
    const bestMatch = results.find(item => {
      const itemTitle = (item.title || item.name || '').toLowerCase();
      const searchTitle = cleanTitle.toLowerCase();
      return itemTitle.includes(searchTitle) || searchTitle.includes(itemTitle);
    }) || results[0];

    const imagePath = bestMatch.poster_path || bestMatch.backdrop_path;
    if (!imagePath) return null;

    const imageUrl = `${TMDB_IMAGE_BASE}${imagePath}`;
    
    // Armazenar no cache
    imageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Erro ao buscar imagem do TMDB:', error);
    return null;
  }
}
