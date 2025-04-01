import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Play } from 'lucide-react';
import { SeriesCard } from '../components/iptv/SeriesCard';
import { AuthProtection } from '../components/auth/AuthProtection';
import { useInfiniteChannels } from '../hooks/useInfiniteChannels';
import { useGroupedSeries } from '../hooks/useGroupedSeries';
import { InfiniteScroll } from '../components/shared/InfiniteScroll';
import { useIPTVStore } from '../store/iptvStore';
import { Channel } from '../types/iptv';

interface GroupedSeries extends Channel {
  episodes: Channel[];
}

export function SeriesPage() {
  const { series } = useIPTVStore();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra as séries baseado no grupo e termo de busca
  const filteredSeries = useMemo(() => {
    console.log('Filtrando séries:', {
      total: series.length,
      grupo: selectedGroup,
      busca: searchTerm
    });

    let filtered = series;

    // Filtra por grupo se selecionado
    if (selectedGroup) {
      filtered = filtered.filter(serie => serie.group_title === selectedGroup);
    }

    // Filtra por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(serie => {
        const name = (serie.name || '').toLowerCase();
        const title = (serie.title || '').toLowerCase();
        return name.includes(searchLower) || title.includes(searchLower);
      });
    }

    // Agrupa séries por nome base
    const grouped = filtered.reduce<Record<string, GroupedSeries>>((acc, serie) => {
      const baseName = serie.name.split(/[sS]\d{2}[eE]\d{2}/)[0].trim();
      if (!acc[baseName]) {
        acc[baseName] = {
          ...serie,
          episodes: []
        };
      }
      acc[baseName].episodes.push(serie);
      return acc;
    }, {});

    const result = Object.values(grouped);
    console.log('Séries filtradas:', {
      total: result.length,
      primeiras: result.slice(0, 2)
    });

    return result;
  }, [series, selectedGroup, searchTerm]);

  // Lista todos os grupos disponíveis
  const availableGroups = useMemo(() => {
    const groups = new Set(series.map(serie => serie.group_title).filter(Boolean));
    const sortedGroups = Array.from(groups).sort();
    console.log('Grupos disponíveis:', sortedGroups);
    return sortedGroups;
  }, [series]);

  return (
    <AuthProtection>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
        {/* Header Fixo */}
        <header className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4">
            {/* Navegação */}
            <div className="flex items-center h-16">
              <Link to="/" className="p-2 hover:bg-white/10 rounded-lg transition">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold ml-2">Séries</h1>
            </div>

            {/* Filtros */}
            <div className="flex gap-4">
              <select
                className="bg-gray-800 text-white rounded px-4 py-2"
                value={selectedGroup || 'all'}
                onChange={(e) => setSelectedGroup(e.target.value === 'all' ? null : e.target.value)}
              >
                <option value="all">Todos os grupos</option>
                {availableGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Buscar séries..."
                className="bg-gray-800 text-white rounded px-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="container mx-auto px-4 pt-40 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSeries.map((serie: GroupedSeries) => (
              <SeriesCard key={serie.id} series={serie} />
            ))}
          </div>

          {!filteredSeries.length && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-white/50" />
              </div>
              <h2 className="text-2xl font-bold text-white/90 mb-2">
                Nenhuma série encontrada
              </h2>
              <p className="text-white/60 max-w-md">
                {searchTerm 
                  ? `Não encontramos nenhuma série com "${searchTerm}"`
                  : selectedGroup
                  ? `Nenhuma série encontrada no grupo "${selectedGroup}"`
                  : 'Tente uma nova busca ou selecione um grupo diferente'}
              </p>
            </div>
          )}
        </main>
      </div>
    </AuthProtection>
  );
}