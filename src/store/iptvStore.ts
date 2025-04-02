import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, determineContentType } from '../types/iptv';
import { FeaturedContent } from '../types/content';
import { loadChannels, loadChannelMetadata, syncChannels, clearChannels, loadChannelDetails, incrementViews } from '../services/channel-sync';
import { classifyContent } from '../services/content-classifier';
import { supabase } from '../lib/supabase';

interface IPTVState {
  movies: Channel[];
  series: Channel[];
  live: Channel[];
  loading: boolean;
  error: string | null;
  favorites: string[];
  watchHistory: string[];
  activeList: string | null;
  featured: FeaturedContent[];
  currentPage: number;
  hasMore: boolean;
  filter: string;
  totalChannels: number;
  loadNextPage: () => Promise<void>;
  setFilter: (filter: string) => void;
  syncFromCloud: () => Promise<void>;
  toggleFavorite: (channelId: string) => void;
  addToWatchHistory: (channelId: string) => void;
  setActiveList: (listId: string | null) => void;
  clearAll: () => Promise<void>;
  setFeatured: (featured: FeaturedContent[]) => void;
  addChannels: (channels: Channel[], source: string) => Promise<{ success: boolean; totalChannels: number; categories: { movies: number; series: number; live: number }; error?: string }>;
}

const PAGE_SIZE = 20; // Reduzido de 50 para 20 para carregamento inicial mais rápido

export const useIPTVStore = create<IPTVState>()(
  persist(
    (set, get) => ({
        movies: [],
        series: [],
      live: [],
      loading: false,
      error: null,
      favorites: [],
      watchHistory: [],
      activeList: null,
      featured: [],
      currentPage: 0,
      hasMore: true,
      filter: '',
      totalChannels: 0,

      loadNextPage: async () => {
        const { currentPage, filter, loading, hasMore } = get();
        
        if (loading) {
          console.log('Ignorando loadNextPage: já está carregando');
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          console.log('Carregando página', currentPage, 'com filtro:', filter || 'nenhum');
          const { channels, total, error } = await loadChannels(currentPage, filter);
          
          if (error) {
            console.error('Erro ao carregar canais:', error);
            set({ error, loading: false });
            return;
          }

          if (!channels || channels.length === 0) {
            console.warn('Nenhum canal retornado da API');
            set({ 
              loading: false,
              hasMore: false,
              error: null
            });
            return;
          }

          console.log('Canais carregados:', channels.length);

          // Adicionar campos padrão para canais sem informações completas
          const channelsWithDefaults = channels.map(channel => ({
            ...channel,
            id: channel.id || `${channel.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            logo: channel.logo || null,
            group_title: channel.group_title || 'Sem Categoria',
            type: channel.type || determineContentType(channel.group_title || '', channel.name || '')
          }));

          console.log('Classificando conteúdo...');
          const classified = classifyContent(channelsWithDefaults);
          console.log('Classificação:', {
            movies: classified.movies.length,
            series: classified.series.length,
            live: classified.live.length,
            exemplos: classified.exemplos
          });

          // Atualizar o estado com os novos canais
          const newState = {
            movies: [...get().movies, ...classified.movies],
            series: [...get().series, ...classified.series],
            live: [...get().live, ...classified.live],
            currentPage: currentPage + 1,
            loading: false,
            hasMore: channels.length === PAGE_SIZE,
            totalChannels: total,
            error: null
          };
          
          set(newState);
          
          // Salvar estatísticas no sessionStorage para acesso fácil
          try {
            const stats = {
              movies: newState.movies.length,
              series: newState.series.length,
              live: newState.live.length,
              total: newState.movies.length + newState.series.length + newState.live.length,
              timestamp: Date.now()
            };
            sessionStorage.setItem('iptv-session-stats', JSON.stringify(stats));
            console.log('Estatísticas salvas no sessionStorage:', stats);
          } catch (statsError) {
            console.error('Erro ao salvar estatísticas no sessionStorage:', statsError);
          }
          
          console.log('Estado atualizado:', {
            movies: newState.movies.length,
            series: newState.series.length,
            live: newState.live.length,
            total
          });
        } catch (error) {
          console.error('Erro ao carregar próxima página:', error);
          set({ 
            loading: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      },

      setFilter: (filter: string) => {
        set({
          filter,
            movies: [],
            series: [],
          live: [],
          currentPage: 0,
          hasMore: true
        });
        get().loadNextPage();
      },

      syncFromCloud: async () => {
        set({ loading: true, error: null });
        
        try {
          console.log('Iniciando sincronização com a nuvem...');
          const { channels, error } = await loadChannelMetadata();
          
          if (error) {
            console.error('Erro ao sincronizar:', error);
            set({ error, loading: false });
            return;
          }

          if (!channels || channels.length === 0) {
            console.warn('Nenhum canal encontrado');
            set({ 
              loading: false,
              error: null,
              movies: [],
              series: [],
              live: [],
              totalChannels: 0
            });
            return;
          }

          console.log('Canais carregados da nuvem:', channels.length);

          // Adicionar timestamp aos IDs para garantir unicidade
          const timestamp = Date.now();
          const channelsWithUniqueIds = channels.map((channel, index) => ({
            ...channel,
            id: channel.id || `${channel.name}-${timestamp}-${index}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
          }));

          // Classificar conteúdo
          console.log('Classificando conteúdo...');
          const classified = classifyContent(channelsWithUniqueIds);
          console.log('Classificação concluída:', {
            total: channels.length,
            movies: classified.movies.length,
            series: classified.series.length,
            live: classified.live.length,
            exemplos: {
              series: classified.series.slice(0, 3).map(s => ({
                name: s.name,
                group: s.group_title
              }))
            }
          });
          
          set({ 
              movies: classified.movies,
              series: classified.series,
            live: classified.live,
            loading: false,
            error: null,
            totalChannels: channels.length
          });

          // Atualizar cache após sucesso
          try {
            const cacheData = {
              timestamp: Date.now(),
              lastSync: Date.now()
            };
            localStorage.setItem('channels_cache_v2', JSON.stringify(cacheData));
            console.log('Cache atualizado com sucesso');
          } catch (err) {
            console.error('Erro ao atualizar cache:', err);
          }

        } catch (err) {
          console.error('Erro ao sincronizar:', err);
          set({ 
            error: null,
            loading: false,
            movies: [],
            series: [],
            live: [],
            totalChannels: 0
          });
        }
      },

      toggleFavorite: (channelId: string) => {
        set(state => {
          const favorites = state.favorites.includes(channelId)
            ? state.favorites.filter(id => id !== channelId)
            : [...state.favorites, channelId];
          return { favorites };
        });
      },

      addToWatchHistory: (channelId: string) => {
        set(state => {
          const history = [
            channelId,
            ...state.watchHistory.filter(id => id !== channelId)
          ].slice(0, 100); // Mantém apenas os últimos 100
          return { watchHistory: history };
        });
      },

      setActiveList: (listId: string | null) => {
        set({ activeList: listId });
      },

      clearAll: async () => {
        set({ loading: true, error: null });
        try {
          await clearChannels();
        set({
            movies: [],
            series: [],
            live: [], 
            loading: false,
            error: null,
          currentPage: 0,
          hasMore: true,
            totalChannels: 0,
            activeList: null
          });
        } catch (error) {
          console.error('Erro ao limpar canais:', error);
          set({ error: 'Erro ao limpar canais', loading: false });
        }
      },

      addChannels: async (channels: Channel[], source: string) => {
        try {
          // Adicionar campos padrão para canais sem informações completas
          const channelsWithDefaults = channels.map(channel => ({
            ...channel,
            id: channel.id || `${channel.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            logo: channel.logo || null,
            group_title: channel.group_title || 'Sem Categoria',
            type: channel.type || determineContentType(channel.group_title || '', channel.name || '')
          }));

          console.log('Classificando conteúdo...');
          const classified = classifyContent(channelsWithDefaults);
          console.log('Classificação:', {
            movies: classified.movies.length,
            series: classified.series.length,
            live: classified.live.length
          });

          // Salvar no banco de dados
          const result = await syncChannels(channelsWithDefaults);
          if (!result.success) {
            throw new Error(result.error || 'Erro ao sincronizar canais');
          }

          // Atualizar o estado
          set((state) => ({
            movies: [...state.movies, ...classified.movies],
            series: [...state.series, ...classified.series],
            live: [...state.live, ...classified.live],
            totalChannels: state.totalChannels + channelsWithDefaults.length,
            activeList: source
          }));

          return {
            success: true,
            totalChannels: channelsWithDefaults.length,
            categories: {
              movies: classified.movies.length,
              series: classified.series.length,
              live: classified.live.length
            }
          };
        } catch (error) {
          console.error('Erro ao adicionar canais:', error);
          return {
            success: false,
            totalChannels: 0,
            categories: { movies: 0, series: 0, live: 0 },
            error: error instanceof Error ? error.message : 'Erro desconhecido ao adicionar canais'
          };
        }
      },

      setFeatured: (featured) => set({ featured }),
    }),
    {
      name: 'iptv-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        watchHistory: state.watchHistory,
        featured: state.featured
      })
    }
  )
);