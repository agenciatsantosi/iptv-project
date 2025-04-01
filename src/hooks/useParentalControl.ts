import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface ParentalControl {
  maxRating: string;
  restrictedCategories: string[];
  pinRequired: boolean;
  pinCode?: string;
}

interface ParentalControlState {
  settings: ParentalControl | null;
  loading: boolean;
  error: string | null;
  fetchSettings: (profileId: string) => Promise<void>;
  updateSettings: (profileId: string, settings: Partial<ParentalControl>) => Promise<void>;
  validatePin: (pin: string) => boolean;
}

export const useParentalControl = create<ParentalControlState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async (profileId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('parental_controls')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error) throw error;
      
      set({ settings: data });
    } catch (error) {
      set({ error: 'Erro ao carregar configurações' });
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (profileId, settings) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('parental_controls')
        .upsert({
          profile_id: profileId,
          ...settings
        });

      if (error) throw error;
      
      get().fetchSettings(profileId);
    } catch (error) {
      set({ error: 'Erro ao atualizar configurações' });
    } finally {
      set({ loading: false });
    }
  },

  validatePin: (pin) => {
    const { settings } = get();
    return settings?.pinCode === pin;
  }
}));