import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { LiveCard } from '../components/iptv/LiveCard';
import { GroupSelector } from '../components/iptv/GroupSelector';
import { AuthProtection } from '../components/auth/AuthProtection';
import { useInfiniteChannels } from '../hooks/useInfiniteChannels';
import { InfiniteScroll } from '../components/shared/InfiniteScroll';
import { SocialMediaBanner } from '../components/shared/SocialMediaBanner';
import { Box, Badge } from '@chakra-ui/react';

// Lista completa de todos os grupos de TV ao vivo (sem coletâneas)
const ALL_LIVE_GROUPS = [
  "RÁDIOS FM",
  "Z - CANAIS: ADULTOS",
  "24 HORAS",
  "U.S.A",
  "PPV / ESPORTES",
  "GLOBO REGIONAIS",
  "GLOBO CAPITAIS",
  "PREMIERE",
  "DISCOVERY",
  "HBO"
];

export function LivePage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Usar o hook de carregamento infinito
  const { 
    channels: live, 
    isLoading, 
    hasMore, 
    loadMore,
    total,
    isLoadingMore
  } = useInfiniteChannels('live');

  // Remove duplicatas e pega todos os grupos
  const uniqueChannels = useMemo(() => 
    Array.from(new Map(live.map(channel => [channel.id, channel])).values()),
    [live]
  );

  // Pega todos os grupos de canais ao vivo
  const groups = useMemo(() => {
    // Obter grupos únicos dos canais carregados
    const uniqueGroups = new Set(uniqueChannels.map(channel => channel.group_title || 'Sem Grupo'));
    
    // Filtrar grupos
    const filteredGroups = Array.from(uniqueGroups).filter(group => {
      // Se o grupo não tiver nome, mantenha-o
      if (!group) return true;
      
      const upperGroup = group.toUpperCase();
      
      // Excluir coletâneas e grupos OND
      if (upperGroup.includes('COLETÂNEA') || 
          upperGroup.includes('COLETANEA') || 
          upperGroup.startsWith('OND /')) {
        return false;
      }
      
      // Incluir apenas grupos específicos de TV ao vivo
      return true;
    });
    
    // Combinar grupos fixos com grupos encontrados
    const combinedGroups = new Set([...ALL_LIVE_GROUPS, ...filteredGroups]);
    
    return Array.from(combinedGroups).sort();
  }, [uniqueChannels]);

  // Filtra canais pelo grupo selecionado e busca
  const filteredChannels = useMemo(() => {
    // Primeiro filtrar canais que não são coletâneas
    let filtered = uniqueChannels.filter(channel => {
      const group = (channel.group_title || '').toUpperCase();
      return !group.includes('COLETÂNEA') && 
             !group.includes('COLETANEA') && 
             !group.startsWith('OND /');
    });
    
    // Depois aplicar filtro de grupo selecionado
    if (selectedGroup) {
      filtered = filtered.filter(channel => channel.group_title === selectedGroup);
    }
    
    // Por fim, aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [uniqueChannels, selectedGroup, searchTerm]);

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
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                    TV ao Vivo
                  </h1>
                  {!isLoading && (
                    <div className="flex gap-2 flex-wrap">
                      <Badge colorScheme="purple" fontSize="sm">
                        {filteredChannels.length} canais
                      </Badge>
                      <Badge colorScheme="green" fontSize="sm">
                        {groups.length} grupos
                      </Badge>
                    </div>
                  )}
                </div>
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
        <div className="container mx-auto px-4 pt-48 pb-8">
          <InfiniteScroll
            hasMore={hasMore}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          >
            {/* Grid de Canais */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredChannels.map((channel) => (
                <LiveCard key={channel.id} channel={channel} />
              ))}
            </div>
          </InfiniteScroll>
          
          {/* Banner de redes sociais */}
          <Box className="mt-8">
            <SocialMediaBanner title="Participe das nossas redes sociais" />
          </Box>
        </div>
      </div>
    </AuthProtection>
  );
}
