import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIPTVStore } from '../store/iptvStore';
import { ArrowLeft, Search } from 'lucide-react';
import { getLiveGroups, filterChannelsByGroup } from '../utils/groups';
import { LiveTVCard } from '../components/iptv/LiveTVCard';
import { GroupSelector } from '../components/iptv/GroupSelector';
import { CategoryBar } from '../components/iptv/CategoryBar';
import { AuthProtection } from '../components/auth/AuthProtection';

const liveCategories = [
  { id: 'todos', name: 'Todos' },
  { id: 'canais-24h', name: 'Canais | 24 horas' },
  { id: 'canais-abertos', name: 'Canais | Abertos' },
  { id: 'canais-filmes', name: 'Canais | Filmes' },
  { id: 'canais-esportes', name: 'Canais | Esportes' },
  { id: 'canais-documentarios', name: 'Canais | Documentários' },
];

export function LiveTVPage() {
  const { live } = useIPTVStore();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Pega todos os grupos de canais ao vivo
  const groups = useMemo(() => {
    return getLiveGroups(live);
  }, [live]);

  // Filtra canais pelo grupo selecionado e busca
  const filteredChannels = useMemo(() => {
    let filtered = selectedGroup ? filterChannelsByGroup(live, selectedGroup) : live;
    
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtra por categoria
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(channel => {
        // Implemente a lógica de filtro por categoria aqui
        // Por exemplo, verificar tags ou metadados do canal
        return true; // Por enquanto retorna todos
      });
    }

    return filtered;
  }, [live, selectedGroup, searchTerm, selectedCategory]);

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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                  TV ao Vivo
                </h1>
              </div>

              {/* Barra de Busca */}
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Buscar canais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              </div>
            </div>

            {/* Barra de Categorias */}
            <div className="mt-6">
              <CategoryBar
                categories={liveCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* Seletor de Grupo */}
            <div className="mt-6">
              <GroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4" style={{ paddingTop: '200px' }}>
          {/* Grid de Canais */}
          {filteredChannels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredChannels.map(channel => (
                <LiveTVCard
                  key={channel.id}
                  channel={channel}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-white/50" />
              </div>
              <h2 className="text-2xl font-bold text-white/90 mb-2">
                {searchTerm ? 'Nenhum canal encontrado' : 'Selecione uma categoria'}
              </h2>
              <p className="text-white/60 max-w-md">
                {searchTerm 
                  ? `Não encontramos nenhum canal com "${searchTerm}". Tente outra busca.`
                  : 'Escolha uma categoria acima para ver os canais disponíveis.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthProtection>
  );
}