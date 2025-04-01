import { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';

// Chave para o localStorage
const FAVORITES_STORAGE_KEY = 'iptv_favorites';

// Função para carregar favoritos do localStorage
const loadFavoritesFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    return [];
  }
};

// Função para salvar favoritos no localStorage
const saveFavoritesToStorage = (favorites: string[]) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
  }
};

export interface FavoritesSlice {
  favorites: string[];
  loading: boolean;
  error: string | null;
  toggleFavorite: (channelId: string) => Promise<void>;
  syncFavorites: () => Promise<void>;
}

export const createFavoritesSlice: StateCreator<FavoritesSlice> = (set, get) => ({
  favorites: loadFavoritesFromStorage(), // Inicializa com dados do localStorage
  loading: false,
  error: null,

  toggleFavorite: async (channelId) => {
    const { favorites } = get();
    const isFavorite = favorites.includes(channelId);
    
    try {
      set({ loading: true, error: null });
      
      if (isFavorite) {
        // Remove do Supabase
        await supabase
          .from('iptv_favorites')
          .delete()
          .eq('channel_id', channelId);
        
        const newFavorites = favorites.filter(id => id !== channelId);
        
        // Atualiza estado e localStorage
        set({ 
          favorites: newFavorites,
          loading: false 
        });
        saveFavoritesToStorage(newFavorites);
      } else {
        // Adiciona ao Supabase
        await supabase
          .from('iptv_favorites')
          .insert({ channel_id: channelId });
        
        const newFavorites = [...favorites, channelId];
        
        // Atualiza estado e localStorage
        set({ 
          favorites: newFavorites,
          loading: false 
        });
        saveFavoritesToStorage(newFavorites);
      }
    } catch (error) {
      set({ 
        error: 'Erro ao atualizar favoritos',
        loading: false 
      });
    }
  },

  syncFavorites: async () => {
    try {
      set({ loading: true, error: null });
      
      // Busca favoritos do Supabase
      const { data, error } = await supabase
        .from('iptv_favorites')
        .select('channel_id');
      
      if (error) throw error;
      
      const cloudFavorites = data.map(f => f.channel_id);
      
      // Combina favoritos da nuvem com locais
      const localFavorites = loadFavoritesFromStorage();
      const allFavorites = Array.from(new Set([...cloudFavorites, ...localFavorites]));
      
      // Atualiza estado e localStorage
      set({ 
        favorites: allFavorites,
        loading: false 
      });
      saveFavoritesToStorage(allFavorites);
    } catch (error) {
      set({ 
        error: 'Erro ao sincronizar favoritos',
        loading: false 
      });
    }
  }
});