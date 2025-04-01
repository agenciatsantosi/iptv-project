import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Channel } from '../types/iptv';

interface OfflineContent {
  id: string;
  contentId: string;
  expiresAt: string;
}

interface OfflineContentState {
  downloads: OfflineContent[];
  loading: boolean;
  error: string | null;
  fetchDownloads: (profileId: string) => Promise<void>;
  downloadContent: (profileId: string, channel: Channel) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
}

export const useOfflineContent = create<OfflineContentState>((set, get) => ({
  downloads: [],
  loading: false,
  error: null,

  fetchDownloads: async (profileId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('offline_content')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      
      set({ downloads: data });
    } catch (error) {
      set({ error: 'Erro ao carregar downloads' });
    } finally {
      set({ loading: false });
    }
  },

  downloadContent: async (profileId, channel) => {
    try {
      set({ loading: true, error: null });
      
      // Adiciona 7 dias de expiração
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('offline_content')
        .insert({
          profile_id: profileId,
          content_id: channel.id,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;
      
      get().fetchDownloads(profileId);
    } catch (error) {
      set({ error: 'Erro ao baixar conteúdo' });
    } finally {
      set({ loading: false });
    }
  },

  removeDownload: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('offline_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        downloads: state.downloads.filter(d => d.id !== id)
      }));
    } catch (error) {
      set({ error: 'Erro ao remover download' });
    } finally {
      set({ loading: false });
    }
  }
}));