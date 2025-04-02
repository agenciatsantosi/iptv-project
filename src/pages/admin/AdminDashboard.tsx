import React, { useEffect, useState } from 'react';
import { Film, Tv, Radio, Database, Server, Percent } from 'lucide-react';
import { useIPTVStore } from '../../store/iptvStore';
import { getSystemStats, SystemStats } from '../../services/stats-service';

export function AdminDashboard() {
  const { movies, series, live, loadNextPage, syncFromCloud } = useIPTVStore();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const stats = await getSystemStats();
        setSystemStats(stats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [movies.length, series.length, live.length]); // Recarregar quando os dados mudarem

  // Função para carregar mais conteúdo
  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      await loadNextPage();
      // As estatísticas serão atualizadas automaticamente pelo useEffect
    } catch (error) {
      console.error('Erro ao carregar mais conteúdo:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Função para carregar todo o conteúdo disponível
  const handleLoadAll = async () => {
    try {
      setLoadingMore(true);
      
      // Verificar quantos itens faltam carregar
      const totalToLoad = systemStats ? 
        systemStats.database.total - systemStats.loaded.total : 0;
      
      if (totalToLoad <= 0) {
        alert('Todo o conteúdo já foi carregado!');
        setLoadingMore(false);
        return;
      }
      
      // Estimar quantas páginas precisamos carregar (50 itens por página)
      const estimatedPages = Math.ceil(totalToLoad / 50);
      console.log(`Iniciando carregamento de aproximadamente ${estimatedPages} páginas...`);
      
      // Carregar páginas sequencialmente
      let loadedPages = 0;
      let hasMoreContent = true;
      
      while (hasMoreContent && loadedPages < estimatedPages) {
        console.log(`Carregando página ${loadedPages + 1} de ~${estimatedPages}...`);
        await loadNextPage();
        loadedPages++;
        
        // Verificar se ainda temos conteúdo para carregar
        const currentStats = await getSystemStats();
        const remainingItems = currentStats.database.total - currentStats.loaded.total;
        
        if (remainingItems <= 0) {
          hasMoreContent = false;
          console.log('Todo o conteúdo foi carregado!');
        }
        
        // Atualizar estatísticas para feedback visual
        setSystemStats(currentStats);
      }
      
      console.log(`Carregamento concluído! ${loadedPages} páginas carregadas.`);
      
    } catch (error) {
      console.error('Erro ao carregar todo o conteúdo:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Função para forçar a inicialização do store
  const handleInitializeStore = async () => {
    try {
      setLoadingInitial(true);
      
      // Limpar o sessionStorage para garantir que estamos começando do zero
      sessionStorage.removeItem('iptv-session-stats');
      
      // Forçar a sincronização com o banco de dados
      await syncFromCloud();
      
      // Recarregar as estatísticas
      const stats = await getSystemStats();
      setSystemStats(stats);
      
      // Mostrar mensagem de sucesso
      alert('Store inicializado com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar store:', error);
      alert('Erro ao inicializar store. Verifique o console para mais detalhes.');
    } finally {
      setLoadingInitial(false);
    }
  };

  // Usar os dados do systemStats para os cards do topo também
  const basicStats = [
    { 
      label: 'Filmes', 
      value: systemStats ? systemStats.loaded.movies : movies.length, 
      dbValue: systemStats?.database.movies || 0,
      icon: Film, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Séries', 
      value: systemStats ? systemStats.loaded.series : series.length, 
      dbValue: systemStats?.database.series || 0,
      icon: Tv, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Canais', 
      value: systemStats ? systemStats.loaded.live : live.length, 
      dbValue: systemStats?.database.live || 0,
      icon: Radio, 
      color: 'bg-purple-500' 
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {basicStats.map(({ label, value, dbValue, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400">{label}</h3>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">de {dbValue.toLocaleString()} no banco</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Estatísticas de Conteúdo
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : systemStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total no Banco de Dados" 
                value={systemStats.database.total.toLocaleString()} 
                icon={<Database className="w-5 h-5" />} 
              />
              <StatCard 
                title="Total Carregado" 
                value={systemStats.loaded.total.toLocaleString()} 
                icon={<Server className="w-5 h-5" />} 
              />
              <StatCard 
                title="Percentual Carregado" 
                value={`${systemStats.loadPercentage.total}%`} 
                icon={<Percent className="w-5 h-5" />} 
              />
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Detalhamento por Categoria</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="pb-2 font-medium">Categoria</th>
                      <th className="pb-2 font-medium">No Banco</th>
                      <th className="pb-2 font-medium">Carregado</th>
                      <th className="pb-2 font-medium">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <StatRow 
                      label="Filmes" 
                      dbCount={systemStats.database.movies} 
                      loadedCount={systemStats.loaded.movies}
                      percentage={systemStats.loadPercentage.movies}
                      icon={<Film className="w-4 h-4 text-blue-500" />}
                    />
                    <StatRow 
                      label="Séries" 
                      dbCount={systemStats.database.series} 
                      loadedCount={systemStats.loaded.series}
                      percentage={systemStats.loadPercentage.series}
                      icon={<Tv className="w-4 h-4 text-green-500" />}
                    />
                    <StatRow 
                      label="TV ao Vivo" 
                      dbCount={systemStats.database.live} 
                      loadedCount={systemStats.loaded.live}
                      percentage={systemStats.loadPercentage.live}
                      icon={<Radio className="w-4 h-4 text-purple-500" />}
                    />
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Progresso de Carregamento</h3>
              <div className="space-y-4">
                <ProgressBar 
                  label="Total" 
                  percentage={systemStats.loadPercentage.total} 
                  color="bg-blue-500" 
                />
                <ProgressBar 
                  label="Filmes" 
                  percentage={systemStats.loadPercentage.movies} 
                  color="bg-blue-500" 
                />
                <ProgressBar 
                  label="Séries" 
                  percentage={systemStats.loadPercentage.series} 
                  color="bg-green-500" 
                />
                <ProgressBar 
                  label="TV ao Vivo" 
                  percentage={systemStats.loadPercentage.live} 
                  color="bg-purple-500" 
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Carregando...
                  </>
                ) : (
                  <>Carregar Mais Conteúdo</>
                )}
              </button>
              
              <button
                onClick={handleLoadAll}
                disabled={loadingMore}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Carregando...
                  </>
                ) : (
                  <>Carregar Todo o Conteúdo</>
                )}
              </button>
              
              <button
                onClick={handleInitializeStore}
                disabled={loadingInitial}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingInitial ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Inicializando...
                  </>
                ) : (
                  <>Reinicializar Store</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Não foi possível carregar as estatísticas
          </div>
        )}
      </div>
    </div>
  );
}

// Componentes auxiliares
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-zinc-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2 text-gray-300">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface StatRowProps {
  label: string;
  dbCount: number;
  loadedCount: number;
  percentage: number;
  icon: React.ReactNode;
}

function StatRow({ label, dbCount, loadedCount, percentage, icon }: StatRowProps) {
  return (
    <tr className="border-b border-zinc-700/50">
      <td className="py-3 flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </td>
      <td className="py-3">{dbCount.toLocaleString()}</td>
      <td className="py-3">{loadedCount.toLocaleString()}</td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div className="w-20 bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span>{percentage}%</span>
        </div>
      </td>
    </tr>
  );
}

interface ProgressBarProps {
  label: string;
  percentage: number;
  color: string;
}

function ProgressBar({ label, percentage, color }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm text-gray-300">{percentage}%</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}