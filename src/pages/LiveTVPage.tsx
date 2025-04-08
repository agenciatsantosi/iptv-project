import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIPTVStore } from '../store/iptvStore';
import { ArrowLeft, Search } from 'lucide-react';
import { getLiveGroups, filterChannelsByGroup } from '../utils/groups';
import { LiveTVCard } from '../components/iptv/LiveTVCard';
import { GroupSelector } from '../components/iptv/GroupSelector';
import { CategoryBar } from '../components/iptv/CategoryBar';
import { AuthProtection } from '../components/auth/AuthProtection';
import { useInfiniteChannels } from '../hooks/useInfiniteChannels';
import { Spinner } from '@chakra-ui/react';

const liveCategories = [
  { id: 'todos', name: 'Todos' },
  { id: 'canais-24h', name: 'Canais | 24 horas' },
  { id: 'canais-abertos', name: 'Canais | Abertos' },
  { id: 'canais-filmes', name: 'Canais | Filmes' },
  { id: 'canais-esportes', name: 'Canais | Esportes' },
  { id: 'canais-documentarios', name: 'Canais | Documentários' },
];

export function LiveTVPage() {
  // Usar o hook useInfiniteChannels para carregar canais ao vivo
  const { channels: liveChannels, isLoading, error, loadMore, hasMore } = useInfiniteChannels('live');
  const { live } = useIPTVStore();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Carregar mais canais quando rolar para o final da página
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 500 &&
        hasMore && 
        !isLoading
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, loadMore]);

  // Pega todos os grupos de canais ao vivo
  const groups = useMemo(() => {
    return getLiveGroups(liveChannels.length > 0 ? liveChannels : live);
  }, [liveChannels, live]);

  // Filtra canais pelo grupo selecionado e busca
  const filteredChannels = useMemo(() => {
    // Usar liveChannels do useInfiniteChannels se disponível, caso contrário usar live do store
    const channelsToUse = liveChannels.length > 0 ? liveChannels : live;
    let filtered = selectedGroup ? filterChannelsByGroup(channelsToUse, selectedGroup) : channelsToUse;
    
    if (searchTerm) {
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtra por categoria
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(channel => {
        const lowerGroupTitle = (channel.group_title || '').toLowerCase();
        
        switch (selectedCategory) {
          case 'canais-24h':
            return lowerGroupTitle.includes('24h') || lowerGroupTitle.includes('24 horas');
          case 'canais-abertos':
            return lowerGroupTitle.includes('aberto') || lowerGroupTitle.includes('aberta');
          case 'canais-filmes':
            return lowerGroupTitle.includes('filme') || lowerGroupTitle.includes('movie');
          case 'canais-esportes':
            return lowerGroupTitle.includes('esporte') || lowerGroupTitle.includes('sport');
          case 'canais-documentarios':
            return lowerGroupTitle.includes('documentario') || lowerGroupTitle.includes('doc');
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [liveChannels, live, selectedGroup, searchTerm, selectedCategory]);

  // Função para limpar o cache e recarregar os canais
  const handleClearCache = () => {
    // Limpar apenas o cache de canais ao vivo
    Object.keys(localStorage).forEach(key => {
      if (key.includes('channels_cache') && key.includes('live')) {
        localStorage.removeItem(key);
      }
    });
    // Recarregar a página
    window.location.reload();
  };

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
            <div className="mt-6 flex justify-between items-center">
              <GroupSelector
                groups={groups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
              />
              
              {/* Botão para limpar cache */}
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition"
              >
                Recarregar Canais
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4" style={{ paddingTop: '200px' }}>
          {/* Indicador de carregamento */}
          {isLoading && filteredChannels.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <Spinner size="xl" color="red.500" />
            </div>
          )}
          
          {/* Mensagem de erro */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h2 className="text-2xl font-bold text-white/90 mb-2">
                Erro ao carregar canais
              </h2>
              <p className="text-white/60 max-w-md mb-4">
                Ocorreu um erro ao carregar os canais. Por favor, tente novamente.
              </p>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Grid de Canais */}
          {!isLoading && !error && filteredChannels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredChannels.map(channel => (
                <LiveTVCard
                  key={channel.id}
                  channel={channel}
                />
              ))}
            </div>
          ) : !isLoading && !error && filteredChannels.length === 0 ? (
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
          ) : null}
          
          {/* Indicador de carregamento no final da lista */}
          {isLoading && filteredChannels.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <Spinner size="md" color="red.500" />
            </div>
          )}
        </div>
      </div>
    </AuthProtection>
  );
}