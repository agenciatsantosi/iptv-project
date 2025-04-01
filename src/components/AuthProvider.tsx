import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, initialized, loading } = useAuth();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}