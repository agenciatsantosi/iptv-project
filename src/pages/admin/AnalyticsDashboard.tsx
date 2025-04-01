import React from 'react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyMetric {
  date: string;
  views: number;
  users: number;
}

interface PopularContent {
  content_id: string;
  content_type: string;
  view_count: number;
  avg_duration_seconds: number;
  total_buffering: number;
  total_errors: number;
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dailyMetrics, setDailyMetrics] = React.useState<DailyMetric[]>([]);
  const [popularContent, setPopularContent] = React.useState<PopularContent[]>([]);

  // Carregar métricas
  const loadMetrics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar métricas diárias dos últimos 7 dias
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const { data: metrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('*')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (metricsError) throw metricsError;

      // Buscar conteúdo popular
      const { data: popular, error: popularError } = await supabase
        .from('popular_content')
        .select('*')
        .limit(10);

      if (popularError) throw popularError;

      // Formatar métricas diárias
      const formattedMetrics = metrics?.reduce((acc: Record<string, DailyMetric>, curr) => {
        const date = new Date(curr.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, views: 0, users: 0 };
        }
        if (curr.metric_type === 'views') acc[date].views = curr.metric_value;
        if (curr.metric_type === 'users') acc[date].users = curr.metric_value;
        return acc;
      }, {});

      setDailyMetrics(Object.values(formattedMetrics || {}));
      setPopularContent(popular || []);
    } catch (error: any) {
      console.error('Erro ao carregar métricas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados quando o componente montar
  React.useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard de Analytics</h1>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Gráfico de Métricas Diárias */}
      <div className="bg-zinc-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Métricas Diárias</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#8884d8" name="Visualizações" />
              <Bar dataKey="users" fill="#82ca9d" name="Usuários" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-purple-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Views</h3>
          <p className="text-3xl font-bold">
            {dailyMetrics.reduce((sum, metric) => sum + metric.views, 0)}
          </p>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Usuários Ativos</h3>
          <p className="text-3xl font-bold">
            {dailyMetrics.reduce((sum, metric) => sum + metric.users, 0)}
          </p>
        </div>
        <div className="bg-blue-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Conteúdos Populares</h3>
          <p className="text-3xl font-bold">{popularContent.length}</p>
        </div>
      </div>

      {/* Tabela de Conteúdo Popular */}
      <div className="bg-zinc-800 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Conteúdo Popular</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-700">
              <th className="px-6 py-3 text-left">Conteúdo</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-right">Views</th>
              <th className="px-6 py-3 text-right">Duração Média</th>
              <th className="px-6 py-3 text-right">Buffering</th>
              <th className="px-6 py-3 text-right">Erros</th>
            </tr>
          </thead>
          <tbody>
            {popularContent.map((content) => (
              <tr key={content.content_id} className="border-t border-zinc-700">
                <td className="px-6 py-4">{content.content_id}</td>
                <td className="px-6 py-4">{content.content_type}</td>
                <td className="px-6 py-4 text-right">{content.view_count}</td>
                <td className="px-6 py-4 text-right">
                  {Math.round(content.avg_duration_seconds / 60)}min
                </td>
                <td className="px-6 py-4 text-right">{content.total_buffering}</td>
                <td className="px-6 py-4 text-right">{content.total_errors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={loadMetrics}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Atualizar Dados
      </button>
    </div>
  );
}
