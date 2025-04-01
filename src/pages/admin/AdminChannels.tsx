import React from 'react';
import { Play, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminProtection } from '../../components/auth/AdminProtection';

interface Channel {
  id: string;
  name: string;
  url: string;
  category: string;
  status: 'active' | 'blocked';
  last_checked: string;
  is_working: boolean;
}

export function AdminChannels() {
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Carregar canais
  const loadChannels = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('name');

      if (error) throw error;
      setChannels(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar canais:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Bloquear/Desbloquear canal
  const toggleChannelStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const { error } = await supabase
        .from('channels')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      await loadChannels();
    } catch (error: any) {
      console.error('Erro ao atualizar status do canal:', error);
      setError(error.message);
    }
  };

  // Deletar canal
  const deleteChannel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadChannels();
    } catch (error: any) {
      console.error('Erro ao deletar canal:', error);
      setError(error.message);
    }
  };

  // Verificar canal
  const checkChannel = async (id: string, url: string) => {
    try {
      // Aqui você implementaria a lógica para verificar se o canal está funcionando
      // Por exemplo, fazendo uma requisição para o stream
      const isWorking = true; // Implementar verificação real

      const { error } = await supabase
        .from('channels')
        .update({
          is_working: isWorking,
          last_checked: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await loadChannels();
    } catch (error: any) {
      console.error('Erro ao verificar canal:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    loadChannels();
  }, []);

  return (
    <AdminProtection>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Play className="w-8 h-8 mr-2" />
            Gerenciamento de Canais
          </h1>
          <button
            onClick={loadChannels}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white"
          >
            Atualizar Lista
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-md text-white">
            {error}
          </div>
        )}

        <div className="bg-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Última Verificação
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
                ) : channels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-white">
                      Nenhum canal encontrado
                    </td>
                  </tr>
                ) : (
                  channels.map((channel) => (
                    <tr key={channel.id} className="hover:bg-zinc-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {channel.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {channel.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            channel.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {channel.status === 'active' ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {channel.last_checked
                          ? new Date(channel.last_checked).toLocaleString()
                          : 'Nunca'}
                        {channel.is_working ? (
                          <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 inline ml-2" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => checkChannel(channel.id, channel.url)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Verificar Canal"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleChannelStatus(channel.id, channel.status)}
                            className={`${
                              channel.status === 'active'
                                ? 'text-yellow-400 hover:text-yellow-300'
                                : 'text-green-400 hover:text-green-300'
                            }`}
                            title={channel.status === 'active' ? 'Bloquear' : 'Ativar'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja deletar este canal?')) {
                                deleteChannel(channel.id);
                              }
                            }}
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
    </AdminProtection>
  );
}
