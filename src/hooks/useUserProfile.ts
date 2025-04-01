import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_genres: string[];
  content_language: string;
  subtitle_language: string;
  autoplay: boolean;
  mature_content: boolean;
  video_quality: string;
}

const defaultProfile: Partial<UserProfile> = {
  display_name: 'Usuário',
  preferred_genres: [],
  content_language: 'pt-BR',
  subtitle_language: 'pt-BR',
  autoplay: true,
  mature_content: false,
  video_quality: 'auto'
};

export function useUserProfile() {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Tentar carregar o perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Se o perfil não existe, criar um novo
        if (fetchError.code === 'PGRST116') {
          const newProfile = {
            user_id: user.id,
            ...defaultProfile
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) throw createError;
          setProfile(createdProfile);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(existingProfile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: loadProfile
  };
}
