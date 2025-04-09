import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Cache em memória para conteúdo
const contentCache = new Map();
const CACHE_DURATION = 3600000; // 1 hora em millisegundos

interface CacheItem {
  data: any;
  timestamp: number;
}

async function fetchContentWithRetry(url: string, retries = 3): Promise<any> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; IPTV/1.0;)'
      }
    });
    return response.data;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchContentWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { type, page = '1', category } = req.query;
    
    if (!type) {
      return res.status(400).json({ error: 'Tipo de conteúdo não especificado' });
    }

    // Gera uma chave única para o cache
    const cacheKey = `${type}-${page}-${category || 'all'}`;
    
    // Verifica se há dados em cache válidos
    const cachedContent = contentCache.get(cacheKey) as CacheItem | undefined;
    if (cachedContent && (Date.now() - cachedContent.timestamp) < CACHE_DURATION) {
      return res.json(cachedContent.data);
    }

    // Constrói a URL base dependendo do tipo de conteúdo
    let apiUrl = '';
    switch(type) {
      case 'movies':
        apiUrl = `https://api.themoviedb.org/3/movie/popular?page=${page}&api_key=${process.env.VITE_TMDB_API_KEY}`;
        break;
      case 'series':
        apiUrl = `https://api.themoviedb.org/3/tv/popular?page=${page}&api_key=${process.env.VITE_TMDB_API_KEY}`;
        break;
      case 'live':
        apiUrl = `${process.env.VITE_API_URL}/api/channels?page=${page}`;
        break;
      default:
        return res.status(400).json({ error: 'Tipo de conteúdo inválido' });
    }

    // Se houver categoria, adiciona ao filtro
    if (category && category !== 'all') {
      apiUrl += `&with_genres=${category}`;
    }

    // Busca o conteúdo com retry
    const data = await fetchContentWithRetry(apiUrl);

    // Processa e otimiza os dados antes de enviar
    const optimizedData = {
      page: Number(page),
      results: data.results?.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date
      })) || [],
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0
    };

    // Armazena no cache
    contentCache.set(cacheKey, {
      data: optimizedData,
      timestamp: Date.now()
    });

    // Configura headers para cache no navegador
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Surrogate-Control', 'public, max-age=86400');
    res.setHeader('Vary', 'Accept-Encoding');

    return res.json(optimizedData);

  } catch (error: any) {
    console.error('Erro ao carregar conteúdo:', error);
    return res.status(500).json({
      error: 'Erro ao carregar conteúdo',
      message: error.message
    });
  }
} 