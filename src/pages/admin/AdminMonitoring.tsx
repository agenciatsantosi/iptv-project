import React from 'react';
import { Activity, Users, Play, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SystemStats {
  total_users: number;
  active_channels: number;
  blocked_channels: number;
  error_rate: number;
  bandwidth_usage: number;
  concurrent_streams: number;
}

interface SystemEvent {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export function AdminMonitoring() {
  const [stats, setStats] = React.useState<SystemStats>({
    total_users: 0,
    active_channels: 0,
    blocked_channels: 0,
    error_rate: 0,
    bandwidth_usage: 0,
    concurrent_streams: 0
  });
  const [events, setEvents] = React.useState<SystemEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar total de usuários
      const { count: userCount } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact' });

      // Buscar canais
      const { data: channels } = await supabase
        .from('channels')
        .select('status');

      const activeChannels = channels?.filter(c => c.status === 'active').length || 0;
      const blockedChannels = channels?.filter(c => c.status === 'blocked').length || 0;

      // Em um sistema real, você buscaria essas informações de um serviço de monitoramento
      setStats({
        total_users: userCount || 0,
        active_channels: activeChannels,
        blocked_channels: blockedChannels,
        error_rate: 0.5, // Exemplo
        bandwidth_usage: 150.5, // Exemplo em MB/s
        concurrent_streams: 25 // Exemplo
      });

      // Buscar eventos do sistema (em um sistema real, viria de um log)
      setEvents([
        {
          id: '1',
          type: 'error',
          message: 'Falha na transmissão do canal XYZ',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'warning',
          message: 'Alto uso de banda detectado',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          type: 'info',
          message: 'Backup automático concluído',
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStats();
    // Em um sistema real, você atualizaria as stats periodicamente
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="bg-zinc-800 p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-semibold text-white mt-1">{value}</p>
        </div>
        <div className="bg-zinc-700 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          {trend > 0 ? (
            <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-400 mr-1" />
          )}
          <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>
            {Math.abs(trend)}% em relação a ontem
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Activity className="w-8 h-8 mr-2" />
          Monitoramento do Sistema
        </h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white"
        >
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-md text-white">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-white">Carregando...</div>
      ) : (
        <>
          {/* Grid de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Usuários Totais"
              value={stats.total_users}
              icon={Users}
              trend={5}
            />
            <StatCard
              title="Canais Ativos"
              value={stats.active_channels}
              icon={Play}
              trend={2}
            />
            <StatCard
              title="Canais Bloqueados"
              value={stats.blocked_channels}
              icon={AlertTriangle}
              trend={-3}
            />
            <StatCard
              title="Taxa de Erro"
              value={`${stats.error_rate}%`}
              icon={AlertTriangle}
              trend={-1}
            />
            <StatCard
              title="Uso de Banda"
              value={`${stats.bandwidth_usage} MB/s`}
              icon={Activity}
              trend={8}
            />
            <StatCard
              title="Streams Simultâneos"
              value={stats.concurrent_streams}
              icon={Users}
              trend={12}
            />
          </div>

          {/* Lista de eventos */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Eventos do Sistema</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg flex items-center ${
                    event.type === 'error'
                      ? 'bg-red-900/20 border border-red-500/50'
                      : event.type === 'warning'
                      ? 'bg-yellow-900/20 border border-yellow-500/50'
                      : 'bg-blue-900/20 border border-blue-500/50'
                  }`}
                >
                  {event.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                  ) : event.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                  ) : (
                    <Activity className="w-5 h-5 text-blue-400 mr-3" />
                  )}
                  <div className="flex-1">
                    <p className="text-white">{event.message}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
