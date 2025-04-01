import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProfileUpdate {
  name?: string;
  email?: string;
}

export function useProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: ProfileUpdate) => {
    try {
      setLoading(true);
      setError(null);

      // Pegar o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      // Atualizar o perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Atualizar o email no auth se fornecido
      if (data.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        });
        if (emailError) throw emailError;
      }

      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}