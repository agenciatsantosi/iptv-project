import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface AuthProtectionProps {
  children: React.ReactNode;
}

export function AuthProtection({ children }: AuthProtectionProps) {
  const { isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Faça login para acessar o conteúdo
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Para assistir filmes, séries e TV ao vivo, você precisa fazer login ou criar uma conta.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-8 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
        >
          Entrar
        </button>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  return children;
}