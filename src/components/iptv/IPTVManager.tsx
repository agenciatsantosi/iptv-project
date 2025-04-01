import React, { useEffect } from 'react';
import { useIPTVStore } from '../../store/iptvStore';
import { useIPTVPlaylist } from '../../hooks/useIPTVPlaylist';
import { ChannelList } from './ChannelList';

export function IPTVManager() {
  const [url, setUrl] = React.useState('');
  const { importPlaylist, loading, error } = useIPTVPlaylist();
  const { channels, favorites, addChannels, toggleFavorite, lastImported, clearAll } = useIPTVStore();

  // Carregar última URL quando o componente montar
  useEffect(() => {
    if (lastImported) {
      setUrl(lastImported);
    }
  }, [lastImported]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      const importedChannels = await importPlaylist(url);
      if (importedChannels) {
        addChannels(importedChannels, url);
      }
    }
  };

  const handleClear = async () => {
    await clearAll();
    setUrl('');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Formulário de importação */}
      <form onSubmit={handleImport} className="space-y-2">
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
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Limpar Dados
          </button>
        </div>
        {lastImported && (
          <p className="text-sm text-gray-400">
            Última lista importada: {lastImported}
          </p>
        )}
      </form>

      {error && (
        <div className="text-red-500 bg-red-500/10 p-4 rounded">
          {error}
        </div>
      )}

      {/* Lista de canais */}
      <ChannelList channels={channels} favorites={favorites} onToggleFavorite={toggleFavorite} />
    </div>
  );
}