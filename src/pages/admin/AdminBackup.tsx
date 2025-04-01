import React from 'react';
import { Database, Download, Upload, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Backup {
  id: string;
  filename: string;
  size_mb: number;
  created_at: string;
  status: 'completed' | 'failed';
  type: 'auto' | 'manual';
}

export function AdminBackup() {
  const [backups, setBackups] = React.useState<Backup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Carregar backups
  const loadBackups = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar backups:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Criar backup
  const createBackup = async () => {
    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      // Em um sistema real, você implementaria a lógica de backup aqui
      const { error } = await supabase
        .from('backups')
        .insert([
          {
            filename: `backup_${new Date().toISOString().split('T')[0]}.zip`,
            size_mb: Math.floor(Math.random() * 1000),
            status: 'completed',
            type: 'manual'
          }
        ]);

      if (error) throw error;
      setSuccess('Backup criado com sucesso!');
      await loadBackups();
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  // Deletar backup
  const deleteBackup = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadBackups();
    } catch (error: any) {
      console.error('Erro ao deletar backup:', error);
      setError(error.message);
    }
  };

  // Download backup
  const downloadBackup = async (filename: string) => {
    // Em um sistema real, você implementaria o download do arquivo
    console.log('Baixando backup:', filename);
  };

  React.useEffect(() => {
    loadBackups();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Database className="w-8 h-8 mr-2" />
          Backup do Sistema
        </h1>
        <button
          onClick={createBackup}
          disabled={creating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white flex items-center disabled:opacity-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          {creating ? 'Criando...' : 'Criar Backup'}
        </button>
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

      <div className="bg-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Arquivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tamanho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-white">
                    Carregando...
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-white">
                    Nenhum backup encontrado
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-zinc-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {backup.size_mb} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          backup.type === 'auto'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {backup.type === 'auto' ? 'Automático' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          backup.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {backup.status === 'completed' ? 'Concluído' : 'Falhou'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => downloadBackup(backup.filename)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
