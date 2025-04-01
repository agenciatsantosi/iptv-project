import { Channel } from '../types/iptv';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log('TMDB API Key:', TMDB_API_KEY ? 'Configurada' : 'Não configurada'); // Debug

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
  number_of_seasons: number;
  number_of_episodes: number;
}

export class TMDBService {
  private static requestQueue: Promise<any>[] = [];
  private static MAX_CONCURRENT_REQUESTS = 40;
  private static RATE_LIMIT_INTERVAL = 10000; // 10 seconds
  private static lastRequestTime = 0;

  private static async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
  
    if (timeSinceLastRequest < this.RATE_LIMIT_INTERVAL / this.MAX_CONCURRENT_REQUESTS) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT_INTERVAL / this.MAX_CONCURRENT_REQUESTS - timeSinceLastRequest)
      );
    }
  
    this.lastRequestTime = Date.now();
  }

  private static async makeRequest(url: string): Promise<Response> {
    await this.rateLimit();
  
    // Remove completed requests from queue
    this.requestQueue = this.requestQueue.filter(p => p.isPending);
  
    // If queue is full, wait for a slot
    while (this.requestQueue.length >= this.MAX_CONCURRENT_REQUESTS) {
      await Promise.race(this.requestQueue);
    }
  
    // Add request to queue
    const requestPromise = fetch(url).finally(() => {
      const index = this.requestQueue.indexOf(requestPromise);
      if (index > -1) {
        this.requestQueue.splice(index, 1);
      }
    });
  
    this.requestQueue.push(requestPromise);
    return requestPromise;
  }

  static async searchMovie(title: string): Promise<TMDBMovie | null> {
    try {
      if (!TMDB_API_KEY) {
        console.error('TMDB API Key não configurada');
        return null;
      }

      const cleanTitle = this.cleanTitle(title);
      console.log('Buscando filme:', { original: title, limpo: cleanTitle }); // Debug
      
      const url = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=pt-BR`;
      console.log('URL da busca:', url.replace(TMDB_API_KEY, '[API_KEY]')); // Debug - esconde a chave
      
      const response = await this.makeRequest(url);
      
      if (!response.ok) {
        if (response.status === 429) { // Too Many Requests
          console.warn('Rate limit atingido, aguardando...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.searchMovie(title); // Retry
        }
        
        console.error('Erro na resposta:', response.status, response.statusText);
        const text = await response.text();
        console.error('Corpo da resposta:', text);
        throw new Error(`Erro na API do TMDB: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resultados filme:', {
        total: data.results?.length,
        primeiro: data.results?.[0]?.title,
        todosResultados: data.results?.map(m => ({ 
          id: m.id, 
          title: m.title,
          year: m.release_date?.split('-')[0]
        }))
      }); // Debug
      
      if (data.results?.length > 0) {
        const movieId = data.results[0].id;
        const details = await this.getMovieDetails(movieId);
        console.log('Detalhes do filme encontrado:', {
          id: details?.id,
          title: details?.title,
          originalTitle: details?.original_title,
          year: details?.release_date?.split('-')[0]
        });
        return details;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar filme:', error);
      return null;
    }
  }

  static async searchSeries(title: string): Promise<TMDBSeries | null> {
    try {
      if (!TMDB_API_KEY) {
        console.error('TMDB API Key não configurada');
        return null;
      }

      const cleanTitle = this.cleanTitle(title);
      console.log('Buscando série:', { original: title, limpo: cleanTitle }); // Debug
      
      // Tenta primeiro com o título limpo
      let url = `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=pt-BR`;
      console.log('URL da busca:', url.replace(TMDB_API_KEY, '[API_KEY]')); // Debug
      
      let response = await this.makeRequest(url);
      
      if (!response.ok) {
        if (response.status === 429) { // Too Many Requests
          console.warn('Rate limit atingido, aguardando...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.searchSeries(title);
        }
        throw new Error(`Erro na API do TMDB: ${response.status}`);
      }
      
      let data = await response.json();
      console.log('Resultados série:', {
        total: data.results?.length,
        primeiro: data.results?.[0]?.name,
        todosResultados: data.results?.map(s => ({
          id: s.id,
          name: s.name,
          year: s.first_air_date?.split('-')[0]
        }))
      }); // Debug
      
      // Se não encontrar resultados, tenta uma busca mais ampla
      if (data.results?.length === 0) {
        const broadTitle = cleanTitle.split(' ')[0]; // Usa apenas a primeira palavra
        url = `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(broadTitle)}&language=pt-BR`;
        console.log('Tentando busca ampla:', url.replace(TMDB_API_KEY, '[API_KEY]'));
        
        response = await this.makeRequest(url);
        if (response.ok) {
          data = await response.json();
          console.log('Resultados busca ampla:', {
            total: data.results?.length,
            primeiro: data.results?.[0]?.name
          });
        }
      }
      
      if (data.results?.length > 0) {
        const seriesId = data.results[0].id;
        const details = await this.getSeriesDetails(seriesId);
        console.log('Detalhes da série:', {
          id: details?.id,
          name: details?.name,
          hasOverview: !!details?.overview,
          hasPoster: !!details?.poster_path,
          hasBackdrop: !!details?.backdrop_path
        });
        return details;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar série:', error);
      return null;
    }
  }

  static async getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
    try {
      if (!TMDB_API_KEY) {
        console.error('TMDB API Key não configurada');
        return null;
      }

      const url = `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`;
      console.log('URL dos detalhes:', url.replace(TMDB_API_KEY, '[API_KEY]')); // Debug - esconde a chave
      
      const response = await this.makeRequest(url);
      
      if (!response.ok) {
        if (response.status === 429) { // Too Many Requests
          console.warn('Rate limit atingido, aguardando...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.getMovieDetails(movieId); // Retry
        }
        
        console.error('Erro na resposta:', response.status, response.statusText);
        const text = await response.text();
        console.error('Corpo da resposta:', text);
        throw new Error(`Erro na API do TMDB: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Detalhes do filme:', {
        id: data.id,
        title: data.title,
        hasOverview: !!data.overview,
        hasPoster: !!data.poster_path,
        hasBackdrop: !!data.backdrop_path
      }); // Debug
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      return null;
    }
  }

  static async getSeriesDetails(seriesId: number): Promise<TMDBSeries | null> {
    try {
      if (!TMDB_API_KEY) {
        console.error('TMDB API Key não configurada');
        return null;
      }

      const url = `${BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}&language=pt-BR`;
      console.log('URL dos detalhes:', url.replace(TMDB_API_KEY, '[API_KEY]')); // Debug - esconde a chave
      
      const response = await this.makeRequest(url);
      
      if (!response.ok) {
        if (response.status === 429) { // Too Many Requests
          console.warn('Rate limit atingido, aguardando...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.getSeriesDetails(seriesId); // Retry
        }
        
        console.error('Erro na resposta:', response.status, response.statusText);
        const text = await response.text();
        console.error('Corpo da resposta:', text);
        throw new Error(`Erro na API do TMDB: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Detalhes da série:', {
        id: data.id,
        name: data.name,
        hasOverview: !!data.overview,
        hasPoster: !!data.poster_path,
        hasBackdrop: !!data.backdrop_path
      }); // Debug
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar detalhes da série:', error);
      return null;
    }
  }

  static getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  static async getFallbackImageUrl(title: string): Promise<string> {
    if (!title) return '/placeholder-movie.jpg';

    // Cache key com normalização do título
    const cacheKey = `tmdb:image:${title.toLowerCase().trim()}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      return cached;
    }

    if (!TMDB_API_KEY) {
      console.warn('TMDB API Key não configurada');
      return '/placeholder-movie.jpg';
    }

    try {
      const cleanTitle = this.cleanTitle(title);
      const url = `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=pt-BR`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results?.length > 0) {
        const result = data.results[0];
        const imagePath = result.poster_path || result.backdrop_path;
        
        if (imagePath) {
          const imageUrl = this.getImageUrl(imagePath);
          // Cache por 24h
          localStorage.setItem(cacheKey, imageUrl);
          localStorage.setItem(`${cacheKey}:timestamp`, String(Date.now()));
          return imageUrl;
        }
      }
      
      return '/placeholder-movie.jpg';
    } catch (error) {
      console.error('Erro ao buscar imagem do TMDB:', error);
      return '/placeholder-movie.jpg';
    }
  }

  static cleanTitle(title: string): string {
    if (!title) return '';
    
    // Remove qualificadores específicos mantendo a estrutura básica do nome
    const removeTerms = [
      'HD', 'FHD', '4K', 'UHD', 'SD', 
      'LEGENDADO', 'DUBLADO', 'LEG', 'DUB',
      'NACIONAL', 'EXTENDED', "DIRECTOR'S CUT",
      '24HRS', '24Hrs', '24hrs'
    ];
    
    // Remove os termos específicos
    let cleanTitle = title;
    removeTerms.forEach(term => {
      cleanTitle = cleanTitle.replace(new RegExp(`\\b${term}\\b`, 'gi'), '');
    });

    // Remove caracteres especiais no final do título
    cleanTitle = cleanTitle
      .replace(/[²³¹]$/, '') // Remove superscript numbers
      .replace(/[-_.]+$/, '') // Remove traços, pontos ou underscores no final
      .trim();

    // Remove espaços extras
    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
    
    return cleanTitle;
  }
}