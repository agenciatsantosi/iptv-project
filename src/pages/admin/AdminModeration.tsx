import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Flag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Report {
  id: string;
  channel_id: string;
  channel_name: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  reported_by: string;
}

export function AdminModeration() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Carregar denúncias
  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('content_reports')
        .select('*, channels(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formatar dados
      const formattedReports = data?.map(report => ({
        ...report,
        channel_name: report.channels?.name || 'Canal Desconhecido'
      })) || [];

      setReports(formattedReports);
    } catch (error: any) {
      console.error('Erro ao carregar denúncias:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status da denúncia
  const updateReportStatus = async (id: string, status: 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await loadReports();
    } catch (error: any) {
      console.error('Erro ao atualizar denúncia:', error);
      setError(error.message);
    }
  };

  // Bloquear canal
  const blockChannel = async (channelId: string) => {
    try {
      const { error } = await supabase
        .from('channels')
        .update({ status: 'blocked' })
        .eq('id', channelId);

      if (error) throw error;
      await loadReports();
    } catch (error: any) {
      console.error('Erro ao bloquear canal:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    loadReports();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <AlertTriangle className="w-8 h-8 mr-2" />
          Moderação de Conteúdo
        </h1>
        <button
          onClick={loadReports}
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
                  Canal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Data
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
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-white">
                    Nenhuma denúncia encontrada
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      <div className="flex items-center">
                        <Flag className="w-4 h-4 mr-2 text-red-400" />
                        {report.channel_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {report.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.status === 'pending'
                          ? 'Pendente'
                          : report.status === 'reviewed'
                          ? 'Em Análise'
                          : 'Resolvido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        {report.status === 'pending' && (
                          <button
                            onClick={() => updateReportStatus(report.id, 'reviewed')}
                            className="text-blue-400 hover:text-blue-300"
                            title="Marcar Em Análise"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                        {report.status === 'reviewed' && (
                          <>
                            <button
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              className="text-green-400 hover:text-green-300"
                              title="Marcar como Resolvido"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => blockChannel(report.channel_id)}
                              className="text-red-400 hover:text-red-300"
                              title="Bloquear Canal"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
