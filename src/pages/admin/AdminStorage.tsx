import React from 'react';
import { HardDrive, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StorageStats {
  total_space_gb: number;
  used_space_gb: number;
  free_space_gb: number;
  cache_size_gb: number;
}

interface StorageItem {
  id: string;
  path: string;
  size_mb: number;
  type: string;
  last_accessed: string;
}

export function AdminStorage() {
  const [stats, setStats] = React.useState<StorageStats>({
    total_space_gb: 1000,
    used_space_gb: 450,
    free_space_gb: 550,
    cache_size_gb: 50
  });
  const [items, setItems] = React.useState<StorageItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cleaning, setCleaning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Em um sistema real, você buscaria essas informações do servidor
      const { data, error } = await supabase
        .from('storage_items')
        .select('*')
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Limpar cache
  const clearCache = async () => {
    try {
      setCleaning(true);
      setError(null);
      setSuccess(null);

      // Em um sistema real, você implementaria a limpeza do cache aqui
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('Cache limpo com sucesso!');
      setStats(prev => ({
        ...prev,
        used_space_gb: prev.used_space_gb - prev.cache_size_gb,
        free_space_gb: prev.free_space_gb + prev.cache_size_gb,
        cache_size_gb: 0
      }));
    } catch (error: any) {
      console.error('Erro ao limpar cache:', error);
      setError(error.message);
    } finally {
      setCleaning(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <HardDrive className="w-8 h-8 mr-2" />
          Gerenciamento de Armazenamento
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={clearCache}
            disabled={cleaning || stats.cache_size_gb === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white flex items-center disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {cleaning ? 'Limpando...' : 'Limpar Cache'}
          </button>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white"
          >
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-md text-white">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-md text-white">
          {success}
        </div>
      )}

      {/* Estatísticas de Armazenamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Espaço Total</h3>
          <p className="text-2xl font-semibold text-white">{stats.total_space_gb} GB</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Espaço Usado</h3>
          <p className="text-2xl font-semibold text-white">{stats.used_space_gb} GB</p>
          <p className="text-sm text-gray-400">
            {((stats.used_space_gb / stats.total_space_gb) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Espaço Livre</h3>
          <p className="text-2xl font-semibold text-white">{stats.free_space_gb} GB</p>
          <p className="text-sm text-gray-400">
            {((stats.free_space_gb / stats.total_space_gb) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Tamanho do Cache</h3>
          <p className="text-2xl font-semibold text-white">{stats.cache_size_gb} GB</p>
          <p className="text-sm text-gray-400">
            {((stats.cache_size_gb / stats.total_space_gb) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-zinc-800 p-6 rounded-lg mb-8">
        <div className="h-4 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${(stats.used_space_gb / stats.total_space_gb) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-400">
          <span>0 GB</span>
          <span>{stats.total_space_gb} GB</span>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="bg-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Arquivo/Diretório
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tamanho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-white">
                    Carregando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-white">
                    Nenhum item encontrado
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {item.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {item.size_mb} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(item.last_accessed).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          // Implementar deleção de item
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
