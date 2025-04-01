import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  name: string;
  avatarUrl?: string;
  preferences: Record<string, any>;
}

interface ProfilesState {
  profiles: Profile[];
  currentProfile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  createProfile: (data: Omit<Profile, 'id'>) => Promise<void>;
  updateProfile: (id: string, data: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setCurrentProfile: (profile: Profile | null) => void;
}

export const useProfiles = create<ProfilesState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  loading: false,
  error: null,

  fetchProfiles: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at');

      if (error) throw error;
      
      set({ profiles: data });
    } catch (error) {
      set({ error: 'Erro ao carregar perfis' });
    } finally {
      set({ loading: false });
    }
  },

  createProfile: async (data) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('user_profiles')
        .insert(data);

      if (error) throw error;
      
      get().fetchProfiles();
    } catch (error) {
      set({ error: 'Erro ao criar perfil' });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (id, data) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      get().fetchProfiles();
    } catch (error) {
      set({ error: 'Erro ao atualizar perfil' });
    } finally {
      set({ loading: false });
    }
  },

  deleteProfile: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      get().fetchProfiles();
    } catch (error) {
      set({ error: 'Erro ao excluir perfil' });
    } finally {
      set({ loading: false });
    }
  },

  setCurrentProfile: (profile) => {
    set({ currentProfile: profile });
  }
}));