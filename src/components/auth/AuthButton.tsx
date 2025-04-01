import React from 'react';
import { supabase } from '../../services/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';

export function AuthButton() {
  const navigate = useNavigate();
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          redirectTo={window.location.origin}
        />
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        navigate('/');
      }}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Sair
    </button>
  );
}
