import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { SeriesCard } from '../components/iptv/SeriesCard';
import { AuthProtection } from '../components/auth/AuthProtection';
import { useInfiniteChannels } from '../hooks/useInfiniteChannels';
import { InfiniteScroll } from '../components/shared/InfiniteScroll';

// Interface para séries agrupadas
interface SeriesData {
  id: string;
  name: string;
  title?: string;
  episodes: any[];
  seasons: number;
  group?: string;
  group_title?: string;
  logo?: string | null;
}

export function SeriesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Usar o hook useInfiniteChannels para carregar as séries
  const { 
    channels: seriesData, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    total,
    isLoadingMore
  } = useInfiniteChannels('series');

  // Função para limpar o nome do grupo (remover prefixos como "Séries 1 -")
  const cleanGroupName = (groupName: string) => {
    // Remove prefixos como "Séries 1 -", "SÉRIES 2 -", etc.
    return groupName.replace(/^S[ée]ries\s+\d+\s+-\s+/i, '');
  };

  // Remove duplicatas e pega todos os grupos
  const uniqueSeries = useMemo(() => 
    Array.from(new Map(seriesData.map(series => [series.id, series])).values()),
    [seriesData]
  );

  // Extrai todos os grupos disponíveis
  const groups = useMemo(() => {
    const uniqueGroups = new Set(uniqueSeries.map(series => series.group_title || 'Sem Grupo'));
    return Array.from(uniqueGroups)
      .filter(group => 
        group.toLowerCase().includes('series') || 
        group.toLowerCase().includes('série') || 
        group.toLowerCase().includes('serie')
      )
      .sort();
  }, [uniqueSeries]);

  // Seleciona automaticamente o primeiro grupo se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedGroup && groups.length > 0) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  // Filtra séries pelo grupo selecionado e busca
  const filteredSeries = useMemo(() => {
    let filtered = selectedGroup 
      ? uniqueSeries.filter(series => series.group_title === selectedGroup)
      : [];  // Se nenhum grupo estiver selecionado, não mostra nenhuma série
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(series => (
        series.name?.toLowerCase().includes(term) ||
        series.full_name?.toLowerCase().includes(term)
      ));
    }

    return filtered;
  }, [uniqueSeries, selectedGroup, searchTerm]);

  // Contagem de séries por grupo
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    groups.forEach(group => {
      counts[group] = uniqueSeries.filter(series => series.group_title === group).length;
    });
    
    return counts;
  }, [uniqueSeries, groups]);

  return (
    <AuthProtection>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
        {/* Header Fixo */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-black/0 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            {/* Navegação */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Séries
                  </h1>
                  {!isLoading && (
                    <p className="text-sm text-white/60">
                      {total} séries disponíveis
                    </p>
                  )}
                </div>
              </div>

              {/* Barra de Busca */}
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Buscar séries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              </div>
            </div>

            {/* Seletor de Grupo */}
            <div className="mt-6 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {groups.map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedGroup === group
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {cleanGroupName(group)} ({groupCounts[group] || 0})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 pt-48 pb-8">
          {error && (
            <div className="text-red-500 text-center py-4">
              Erro ao carregar séries: {error.message}
            </div>
          )}

          <InfiniteScroll
            hasMore={hasMore}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          >
            {/* Grid de Séries */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredSeries.map((series) => (
                <SeriesCard 
                  key={series.id} 
                  series={{
                    ...series,
                    episodes: series.episodes || [],
                    seasons: series.seasons || 1
                  }} 
                />
              ))}
            </div>
          </InfiniteScroll>

          {/* Mensagem se não houver séries */}
          {!isLoading && filteredSeries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhuma série encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </AuthProtection>
  );
}