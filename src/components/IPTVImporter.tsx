import React, { useState } from 'react';
import { useIPTVPlaylist } from '../hooks/useIPTVPlaylist';
import { useAuthContext } from '../contexts/AuthContext';
import { useIPTVStore } from '../store/iptvStore';

export function IPTVImporter() {
  const [url, setUrl] = useState('');
  const { importPlaylist, loading, error, channels } = useIPTVPlaylist();
  const { user, isAuthenticated } = useAuthContext();
  const { syncFromCloud, isSyncing, syncError } = useIPTVStore();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Você precisa estar logado para importar canais');
      return;
    }
    if (url) {
      await importPlaylist(url);
    }
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para sincronizar');
      return;
    }
    await syncFromCloud();
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg mb-4">Faça login para importar e sincronizar seus canais</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-400">Logado como: {user?.email}</p>
      </div>

      <form onSubmit={handleImport} className="mb-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Cole a URL da sua lista M3U8"
            className="flex-1 px-4 py-2 rounded bg-zinc-800 text-white"
            required
          />
          <button
            type="submit"
            disabled={loading || isSyncing}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar'}
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={loading || isSyncing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      </form>

      {(error || syncError) && (
        <div className="text-red-500 mb-4">
          {error || syncError}
        </div>
      )}

      {channels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-zinc-800 p-4 rounded">
              <div className="flex items-center gap-3">
                {channel.logo && (
                  <img src={channel.logo} alt={channel.name} className="w-10 h-10 object-contain" />
                )}
                <div>
                  <h3 className="font-medium">{channel.name}</h3>
                  <p className="text-sm text-gray-400">{channel.group}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}