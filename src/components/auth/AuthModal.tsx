import React from 'react';
import { X } from 'lucide-react';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {mode === 'login' ? 'Entrar' : 'Criar Conta'}
        </h2>

        <AuthForm 
          mode={mode} 
          onSuccess={onClose} 
        />

        <p className="mt-4 text-center text-sm text-gray-400">
          {mode === 'login' ? "Não tem uma conta?" : 'Já tem uma conta?'}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="ml-2 text-purple-500 hover:text-purple-400"
          >
            {mode === 'login' ? 'Criar Conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}