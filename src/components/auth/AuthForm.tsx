import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { ErrorMessage } from '../ui/ErrorMessage';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { signIn, signUp, isLoading } = useAuthContext();
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const success = mode === 'login'
        ? await signIn(formData.email, formData.password)
        : await signUp(formData.email, formData.password, formData.name);

      if (success) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar requisição');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}

      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-zinc-800 rounded px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            required
            placeholder="Seu nome completo"
            disabled={isLoading}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full bg-zinc-800 rounded px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          required
          placeholder="seu@email.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full bg-zinc-800 rounded px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          required
          placeholder="Sua senha"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
      </button>
    </form>
  );
}