import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthError } from '../types/auth';

export function useAuthActions() {
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError({
        message: err.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos'
          : 'Erro ao fazer login',
        code: err.code
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          name,
          email
        });
      }

      return true;
    } catch (err: any) {
      setError({
        message: err.message,
        code: err.code
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (err: any) {
      setError({
        message: 'Erro ao sair da conta',
        code: err.code
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    error,
    loading
  };
}