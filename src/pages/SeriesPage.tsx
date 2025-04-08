import React, { useState, useEffect, useRef } from 'react';
import { useIPTVStore } from '../store/iptvStore';
import { Box, Container, VStack, Text, Heading, SimpleGrid, Flex, Button, Menu, MenuButton, MenuList, MenuItem, Icon, Input, InputGroup, InputLeftElement, Badge, useToast, Spinner } from '@chakra-ui/react';
import { SocialMediaBanner } from '../components/shared/SocialMediaBanner';
import { SeriesCard } from '../components/iptv/SeriesCard';
import { FiChevronDown, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { Channel } from '../types/iptv';
import { supabase } from '../lib/supabase';

// Interface para séries agrupadas (usada para tipagem)
interface SeriesData {
  id: string;
  name: string;
  title?: string;
  episodes: Channel[];
  seasons: number;
  group?: string;
  group_title?: string;
  logo?: string | null;
  rating?: string;
}

// Lista completa de todos os grupos de séries
const ALL_SERIES_GROUPS = [
  "SÉRIES | GLOBOPLAY",
  "SÉRIES | NETFLIX",
  "SÉRIES | DISNEY PLUS",
  "SÉRIES | AMAZON PRIME VIDEO",
  "SÉRIES | LEGENDADAS",
  "SÉRIES | MAX",
  "Sem Categoria",
  "SÉRIES | PARAMOUNT PLUS",
  "SÉRIES | OUTRAS PRODUTORAS",
  "SÉRIES | CRUNCHYROLL",
  "SÉRIES | NOW",
  "SÉRIES | DISCOVERY +",
  "SÉRIES | APPLE TV PLUS",
  "NOVELAS TURCAS",
  "SÉRIES | CLARO VIDEO"
];

export function SeriesPage() {
  const { series, loading: isLoading, syncFromCloud } = useIPTVStore();
  const toast = useToast();
  
  // Estados para filtros e pesquisa
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSeries, setFilteredSeries] = useState<SeriesData[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Contadores para estatísticas
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [totalSeries, setTotalSeries] = useState(0);
  const [totalGroups, setTotalGroups] = useState(ALL_SERIES_GROUPS.length);
  
  // Estado para armazenar todos os grupos disponíveis - inicializado com a lista completa
  const [allGroups, setAllGroups] = useState<string[]>(ALL_SERIES_GROUPS);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Função para contar episódios manualmente
  const countEpisodes = () => {
    let count = 0;
    let seriesWithEpisodes = 0;
    
    console.log('Verificando episódios em', series.length, 'séries');
    
    series.forEach((s, index) => {
      if (s.episodes && Array.isArray(s.episodes)) {
        count += s.episodes.length;
        seriesWithEpisodes++;
        if (index < 5) { // Mostrar apenas as primeiras 5 séries para não sobrecarregar o console
          console.log(`Série ${s.title || s.name} tem ${s.episodes.length} episódios`);
        }
      } else if (index < 5) {
        console.log(`Série ${s.title || s.name} não tem episódios ou não é um array`);
      }
    });
    
    console.log(`Total de episódios contados manualmente: ${count} em ${seriesWithEpisodes} séries com episódios`);
    return count;
  };

  // Agrupar séries por nome para evitar duplicatas
  const groupedSeries = React.useMemo(() => {
    console.log('Recalculando séries agrupadas com', series.length, 'séries');
    
    const seriesMap = new Map<string, SeriesData>();
    let episodeCount = 0;
    let seriesWithEpisodes = 0;
    
    // Agrupamos por nome para evitar duplicatas
    series.forEach(s => {
      // Ignorar itens sem nome para o agrupamento de séries
      if (!s.name && !s.title) return;
      
      const seriesName = s.title || s.name;
      if (!seriesMap.has(seriesName)) {
        // Contar episódios de forma segura
        const episodes = s.episodes || [];
        
        if (episodes.length > 0) {
          seriesWithEpisodes++;
        }
        
        episodeCount += episodes.length;
        
        seriesMap.set(seriesName, {
          id: s.id,
          name: s.name,
          title: s.title,
          episodes: episodes,
          seasons: s.seasons || 1,
          group: s.group,
          group_title: s.group_title,
          logo: s.logo,
          rating: s.rating as string
        });
      }
    });
    
    // Atualizar contadores
    console.log(`Total de episódios calculado no useMemo: ${episodeCount} em ${seriesWithEpisodes} séries com episódios`);
    console.log(`Total de séries únicas: ${seriesMap.size}`);
    
    setTotalEpisodes(episodeCount);
    setTotalSeries(seriesMap.size);
    
    return Array.from(seriesMap.values());
  }, [series]);

  // Carregar séries ao montar o componente
  useEffect(() => {
    console.log('Efeito de carregamento inicial executado');
    console.log('Séries carregadas:', series.length);
    
    // Verificar se já temos séries carregadas
    if (series.length === 0) {
      console.log('Nenhuma série carregada, sincronizando do cloud');
      syncFromCloud();
    } else {
      console.log('Séries já carregadas, verificando episódios');
      // Contar episódios manualmente como verificação adicional
      const manualEpisodeCount = countEpisodes();
      if (manualEpisodeCount > 0 && totalEpisodes === 0) {
        console.log('Atualizando contagem de episódios para', manualEpisodeCount);
        setTotalEpisodes(manualEpisodeCount);
      }
    }
  }, [series.length, syncFromCloud, totalEpisodes]);

  // Selecionar o primeiro grupo quando a lista de grupos for carregada
  useEffect(() => {
    if (allGroups.length > 0 && !selectedGroup) {
      console.log('Selecionando o primeiro grupo:', allGroups[0]);
      setSelectedGroup(allGroups[0]);
    }
  }, [allGroups, selectedGroup]);

  // Filtrar séries com base no grupo selecionado e termo de pesquisa
  useEffect(() => {
    let filtered = groupedSeries;
    
    // Filtrar por grupo
    if (selectedGroup) {
      filtered = filtered.filter(s => (s.group_title || 'Sem Grupo') === selectedGroup);
    }
    
    // Filtrar por termo de pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        (s.title || s.name || '').toLowerCase().includes(term)
      );
    }
    
    console.log(`Séries filtradas: ${filtered.length} de ${groupedSeries.length}`);
    setFilteredSeries(filtered);
  }, [groupedSeries, selectedGroup, searchTerm]);

  // Fechar dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // O dropdown já é gerenciado pelo Chakra UI Menu, não precisamos controlar o estado
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Função para pesquisar
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Função para recarregar os grupos
  const handleRefreshGroups = () => {
    // Recarregar a lista completa de grupos
    setAllGroups(ALL_SERIES_GROUPS);
    setTotalGroups(ALL_SERIES_GROUPS.length);
    
    toast({
      title: "Grupos atualizados",
      description: `Exibindo todos os ${ALL_SERIES_GROUPS.length} grupos disponíveis`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box bg="#000" minH="100vh" color="white">
      <Container maxW="container.xl" py={4}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="xl" mb={2}>
              Séries
            </Heading>
            
            <Flex gap={2} flexWrap="wrap" justifyContent="flex-end">
              <Badge colorScheme="purple" fontSize="sm" p={1}>
                {totalSeries} séries
              </Badge>
              <Badge colorScheme="blue" fontSize="sm" p={1}>
                {totalEpisodes} episódios
              </Badge>
              <Badge colorScheme="green" fontSize="sm" p={1}>
                {totalGroups} grupos
              </Badge>
            </Flex>
          </Flex>

          {/* Barra de filtros e pesquisa */}
          <Flex 
            direction={{ base: "column", md: "row" }} 
            gap={4} 
            mb={4}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
          >
            {/* Dropdown de grupos com botão de atualização */}
            <Flex width={{ base: "100%", md: "300px" }} gap={2}>
              <Box flex="1" ref={dropdownRef}>
                <Menu>
                  <MenuButton 
                    as={Button} 
                    rightIcon={loadingGroups ? <Spinner size="sm" /> : <Icon as={FiChevronDown} />}
                    width="100%"
                    bg="#111"
                    color="white"
                    _hover={{ bg: "#222" }}
                    _active={{ bg: "#333" }}
                    textAlign="left"
                    isDisabled={loadingGroups}
                  >
                    {selectedGroup || 'Selecione um grupo'}
                  </MenuButton>
                  <MenuList 
                    bg="#111" 
                    borderColor="#333"
                    maxH="300px"
                    overflowY="auto"
                    zIndex={10}
                  >
                    {allGroups.map((group) => (
                      <MenuItem 
                        key={group} 
                        onClick={() => setSelectedGroup(group)}
                        bg="#111"
                        _hover={{ bg: "#333" }}
                        color={selectedGroup === group ? "yellow.400" : "white"}
                        fontWeight={selectedGroup === group ? "bold" : "normal"}
                      >
                        {group}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
              <Button
                onClick={handleRefreshGroups}
                bg="#111"
                color="white"
                _hover={{ bg: "#222" }}
                _active={{ bg: "#333" }}
                isDisabled={loadingGroups}
                title="Atualizar grupos"
              >
                <Icon as={FiRefreshCw} />
              </Button>
            </Flex>

            {/* Barra de pesquisa */}
            <InputGroup width={{ base: "100%", md: "300px" }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Pesquisar séries..." 
                onChange={handleSearch}
                bg="#111"
                border="1px solid"
                borderColor="#333"
                _hover={{ borderColor: "#444" }}
                _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #FFCC00" }}
              />
            </InputGroup>
          </Flex>

          {/* Estado de carregamento */}
          {isLoading ? (
            <Flex justify="center" align="center" h="300px">
              <Text>Carregando séries...</Text>
            </Flex>
          ) : filteredSeries.length === 0 ? (
            <Flex justify="center" align="center" h="300px" direction="column" gap={4}>
              <Text>Nenhuma série encontrada.</Text>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm('')}
                  colorScheme="yellow"
                  size="sm"
                >
                  Limpar pesquisa
                </Button>
              )}
            </Flex>
          ) : (
            <>
              {/* Título com contagem */}
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="lg" fontWeight="medium">
                  {filteredSeries.length} {filteredSeries.length === 1 ? 'série encontrada' : 'séries encontradas'}
                </Text>
              </Flex>

              {/* Lista de séries */}
              <SimpleGrid 
                columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} 
                spacing={4} 
                mb={6}
              >
                {filteredSeries.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                  />
                ))}
              </SimpleGrid>
            </>
          )}
            
          {/* Banner de redes sociais */}
          <SocialMediaBanner title="Participe das nossas redes sociais" />
        </VStack>
      </Container>
    </Box>
  );
}