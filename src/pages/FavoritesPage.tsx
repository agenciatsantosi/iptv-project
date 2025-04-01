import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Button,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft, FiFilm, FiTv, FiMonitor } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useIPTVStore } from '../store/iptvStore';
import { ContentCard } from '../components/shared/ContentCard';

export function FavoritesPage() {
  const { movies, series, live, favorites, syncFromCloud } = useIPTVStore();
  const toast = useToast();
  
  const bgGradient = useColorModeValue(
    'linear(to-b, brand.background.primary, brand.background.secondary)',
    'linear(to-b, gray.900, gray.800)'
  );

  useEffect(() => {
    // Carregar dados do servidor se necessário
    if (!movies.length && !series.length && !live.length) {
      syncFromCloud().catch(error => {
        toast({
          title: "Erro ao carregar conteúdo",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
    }
  }, []);

  // Log para debug
  console.log('Estado atual:', {
    totalMovies: movies.length,
    totalSeries: series.length,
    totalLive: live.length,
    favorites,
  });

  // Transformar os dados do IPTV para o formato dos cards
  const transformContent = (items: any[] = []) => {
    if (!items) return [];
    
    return items.map(item => ({
      id: item.id,
      title: item.name,
      posterUrl: item.posterPath || item.thumbnailPath || item.logo || '',
      type: item.type,
      rating: item.rating || 'TV-MA',
      year: item.year || '2025',
      duration: item.duration || '2h',
      url: item.url,
    }));
  };

  // Filtrar conteúdo favoritado
  const favoriteMovies = transformContent(
    movies?.filter(movie => favorites?.includes(movie.id)) || []
  );
  
  const favoriteSeries = transformContent(
    series?.filter(serie => favorites?.includes(serie.id)) || []
  );
  
  const favoriteLive = transformContent(
    live?.filter(channel => favorites?.includes(channel.id)) || []
  );

  // Log para debug dos favoritos filtrados
  console.log('Favoritos filtrados:', {
    favoriteMovies: favoriteMovies.length,
    favoriteSeries: favoriteSeries.length,
    favoriteLive: favoriteLive.length,
  });

  const renderEmptyState = () => (
    <Box textAlign="center" py={10}>
      <Text color="whiteAlpha.700">
        Nenhum conteúdo favoritado ainda. Explore nosso catálogo e adicione seus favoritos!
      </Text>
    </Box>
  );

  const renderContent = (content: any[]) => {
    if (!content || content.length === 0) return renderEmptyState();

    return (
      <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={4}>
        {content.map(item => (
          <ContentCard key={item.id} content={item} />
        ))}
      </SimpleGrid>
    );
  };

  // Se não houver favoritos, mostrar mensagem
  if (!favorites || favorites.length === 0) {
    return (
      <Box minH="100vh" bgGradient={bgGradient}>
        <Box bg="whiteAlpha.100" borderBottom="1px" borderColor="whiteAlpha.200">
          <Container maxW="container.xl" py={4}>
            <Link to="/">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Voltar
              </Button>
            </Link>
            <Heading color="white" size="lg" mt={2}>
              Meus Favoritos
            </Heading>
          </Container>
        </Box>
        <Container maxW="container.xl" py={8}>
          <Box textAlign="center" py={20}>
            <Text color="whiteAlpha.700" fontSize="xl" mb={4}>
              Você ainda não tem favoritos
            </Text>
            <Text color="whiteAlpha.500">
              Explore nosso catálogo e clique no coração para adicionar aos favoritos
            </Text>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Header */}
      <Box bg="whiteAlpha.100" borderBottom="1px" borderColor="whiteAlpha.200">
        <Container maxW="container.xl" py={4}>
          <Link to="/">
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Voltar
            </Button>
          </Link>
          <Heading color="white" size="lg" mt={2}>
            Meus Favoritos ({favorites.length})
          </Heading>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Tabs variant="soft-rounded" colorScheme="brand">
          <TabList mb={6}>
            <Tab gap={2}>
              <Icon as={FiFilm} />
              <Text>Filmes ({favoriteMovies.length})</Text>
            </Tab>
            <Tab gap={2}>
              <Icon as={FiTv} />
              <Text>Séries ({favoriteSeries.length})</Text>
            </Tab>
            <Tab gap={2}>
              <Icon as={FiMonitor} />
              <Text>TV Online ({favoriteLive.length})</Text>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              {renderContent(favoriteMovies)}
            </TabPanel>
            <TabPanel p={0}>
              {renderContent(favoriteSeries)}
            </TabPanel>
            <TabPanel p={0}>
              {renderContent(favoriteLive)}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
