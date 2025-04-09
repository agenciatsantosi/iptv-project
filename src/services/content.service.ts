import { supabase } from '../lib/supabase';

interface ContentFilter {
  page?: number;
  limit?: number;
  category?: string;
  type?: 'movies' | 'series' | 'live';
}

class ContentService {
  private async handleError(error: any) {
    console.error('Content service error:', error);
    return {
      error: error?.message || 'An error occurred while fetching content',
      results: [],
      total: 0,
      page: 1,
      total_pages: 0
    };
  }

  async getContent(type: string, filter: ContentFilter = {}) {
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
        .select('*', { count: 'exact' });

      // Aplicar filtro por tipo
      if (type) {
        query = query.eq('type', type);
      }

      // Aplicar filtro por categoria
      if (category) {
        query = query.eq('category', category);
      }

      // Aplicar paginação e ordenação
      query = query
        .range(start, end)
        .order('name', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

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

  async getMovies(filter: ContentFilter = {}) {
    return this.getContent('movies', filter);
  }

  async getSeries(filter: ContentFilter = {}) {
    return this.getContent('series', filter);
  }

  async getLiveChannels(filter: ContentFilter = {}) {
    return this.getContent('live', filter);
  }

  async getChannelById(id: string) {
    try {
      if (!id) throw new Error('Channel ID is required');

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Channel not found');
      }

      return {
        result: data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching channel by ID:', error);
      return {
        result: null,
        error: error instanceof Error ? error.message : 'Error fetching channel'
      };
    }
  }
}

export const contentService = new ContentService(); 