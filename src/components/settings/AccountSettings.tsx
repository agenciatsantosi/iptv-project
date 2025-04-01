import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AccountSettings() {
  const { profile, user } = useAuthContext();
  const { updateProfile, loading, error } = useProfileSettings();
  const [name, setName] = React.useState(profile?.name || '');
  const [saved, setSaved] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ name });
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full px-4 py-2 bg-zinc-800 text-gray-400 rounded-lg cursor-not-allowed"
        />
        <p className="text-sm text-gray-400 mt-1">O email não pode ser alterado</p>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Salvar'}
        </button>

        {saved && (
          <span className="text-green-500 text-sm">Alterações salvas!</span>
        )}
      </div>
    </form>
  );
}