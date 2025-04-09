import { supabase } from '../lib/supabase';

export interface ContentFilter {
  page?: number;
  limit?: number;
  category?: string;
  type?: 'movies' | 'series' | 'live';
}

class ContentService {
  private async handleError(error: any) {
    console.error('Erro no serviço de conteúdo:', error);
    throw new Error(error.message || 'Erro ao acessar o conteúdo');
  }

  async getMovies(filter: ContentFilter = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category
      } = filter;

      const start = (page - 1) * limit;
      const end = start + limit - 1;

      let query = supabase
        .from('movies')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        results: data || [],
        total: count || 0,
        page,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSeries(filter: ContentFilter = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category
      } = filter;

      const start = (page - 1) * limit;
      const end = start + limit - 1;

      let query = supabase
        .from('series')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        results: data || [],
        total: count || 0,
        page,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getLiveChannels(filter: ContentFilter = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category
      } = filter;

      const start = (page - 1) * limit;
      const end = start + limit - 1;

      let query = supabase
        .from('channels')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('name', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        results: data || [],
        total: count || 0,
        page,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getContent(type: string, filter: ContentFilter = {}) {
    switch (type) {
      case 'movies':
        return this.getMovies(filter);
      case 'series':
        return this.getSeries(filter);
      case 'live':
        return this.getLiveChannels(filter);
      default:
        throw new Error('Tipo de conteúdo inválido');
    }
  }
}

export const contentService = new ContentService(); 