import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, ProfileState } from '../types/profile';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfile: null,

      setActiveProfile: (profile) => {
        set({ activeProfile: profile });
      },

      addProfile: async (profileData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newProfile: Profile = {
          id: uuidv4(),
          name: profileData.name || 'New Profile',
          avatarUrl: profileData.avatarUrl || '/default-avatar.png',
          isKidsProfile: profileData.isKidsProfile || false,
          preferences: {
            language: 'pt-BR',
            contentRating: ['L', '10', '12', '14', '16', '18'],
            favoriteGenres: [],
            autoplayPreviews: true,
            autoplayNextEpisode: true,
          },
          watchHistory: [],
          watchlist: [],
          achievements: [],
          ...profileData,
        };

        const { data, error } = await supabase
          .from('profiles')
          .insert([{ ...newProfile, user_id: user.id }]);

        if (!error) {
          set((state) => ({
            profiles: [...state.profiles, newProfile],
          }));
        }
      },

      updateProfile: async (id, updates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .match({ id, user_id: user.id });

        if (!error) {
          set((state) => ({
            profiles: state.profiles.map((profile) =>
              profile.id === id ? { ...profile, ...updates } : profile
            ),
            activeProfile:
              state.activeProfile?.id === id
                ? { ...state.activeProfile, ...updates }
                : state.activeProfile,
          }));
        }
      },

      deleteProfile: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .delete()
          .match({ id, user_id: user.id });

        if (!error) {
          set((state) => ({
            profiles: state.profiles.filter((profile) => profile.id !== id),
            activeProfile:
              state.activeProfile?.id === id ? null : state.activeProfile,
          }));
        }
      },
    }),
    {
      name: 'profile-storage',
    }
  )
);
