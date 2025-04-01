import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

interface AdminProtectionProps {
  children: React.ReactNode;
}

export function AdminProtection({ children }: AdminProtectionProps) {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const { user } = useAuthContext();

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  if (isAdmin === null) {
    return <div>Carregando...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
