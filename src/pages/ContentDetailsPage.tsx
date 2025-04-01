import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  Badge,
  useColorModeValue,
  IconButton,
  SimpleGrid,
  Skeleton,
  Avatar,
  Wrap,
  WrapItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlay, FiHeart, FiStar } from 'react-icons/fi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useIPTVStore } from '../store/iptvStore';
import { useAuthContext } from '../contexts/AuthContext';
import { useTMDB } from '../hooks/useTMDB';
import { TMDBService } from '../lib/tmdb';
import { ContentReactions } from '../components/ContentReactions';

export function ContentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies, series, favorites, toggleFavorite } = useIPTVStore();
  const { isAuthenticated } = useAuthContext();
  const toast = useToast();

  // Sincronizar favoritos ao montar o componente
  React.useEffect(() => {
    useIPTVStore.getState().syncFavorites();
  }, []);

  const bgGradient = useColorModeValue(
    'linear(to-b, brand.background.primary, brand.background.secondary)',
    'linear(to-b, gray.900, gray.800)'
  );

  // Encontrar o conteúdo em filmes ou séries
  const content = [...(movies || []), ...(series || [])].find(item => item.id === id);

  // Verificar se está nos favoritos
  const isFavorite = favorites?.includes(content?.id || '');

  // Log para debug
  console.log('ContentDetailsPage:', {
    contentId: content?.id,
    favorites,
    isFavorite
  });

  // Limpar título para busca no TMDb
  const baseTitle = content?.name
    ? content.name
        .replace(/\s+(?:Vol\.\s*\d+)?(?:\s*S\d+\s*E\d+)?(?:\s*[-–]\s*(?:EP|Episodio|Episódio|Cap|Capitulo|Capítulo)?\s*\d+)?.*$/i, '')
        .trim()
    : '';

  // Buscar dados do TMDb
  const { data: tmdbData, loading } = useTMDB(baseTitle, 'movie');

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para adicionar aos favoritos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!content?.id) return;

    try {
      await toggleFavorite(content.id);
      toast({
        title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePlay = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: `/watch/${content.id}` }
      });
      return;
    }

    if (content.url) {
      navigate(`/watch/${content.id}`);
    }
  };

  if (!content) {
    return (
      <Box minH="100vh" bgGradient={bgGradient}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={4} align="center">
            <Heading color="white">Conteúdo não encontrado</Heading>
            <Button
              as={Link}
              to="/"
              leftIcon={<FiArrowLeft />}
              colorScheme="brand"
            >
              Voltar para Home
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Encontrar trailer
  const trailer = tmdbData?.videos?.results.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Header com imagem de fundo */}
      <Box
        position="relative"
        height="80vh"
        mt="80px"
        backgroundImage={tmdbData?.backdrop_path 
          ? `url(${TMDBService.getImageUrl(tmdbData.backdrop_path, 'original')})`
          : `url(${content.posterPath || content.thumbnailPath || content.logo})`}
        backgroundSize="cover"
        backgroundPosition="center"
        zIndex={20}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.95) 100%)',
          zIndex: -1
        }}
      >
        <Container maxW="container.xl" height="100%" position="relative">
          <VStack
            height="100%"
            justify="flex-end"
            align="flex-start"
            spacing={6}
            pb={16}
            px={4}
          >
            {/* Poster e Informações */}
            <HStack spacing={8} width="100%" align="flex-start">
              {/* Poster */}
              <Box
                width="300px"
                minWidth="300px"
                height="450px"
                overflow="hidden"
                borderRadius="xl"
                boxShadow="2xl"
                position="relative"
                top="-50px"
                transform="translateY(-50px)"
              >
                <Image
                  src={content.posterPath || content.thumbnailPath || content.logo}
                  alt={content.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
              </Box>

              {/* Informações */}
              <VStack align="flex-start" spacing={6} flex={1} pt={8}>
                {/* Título e Metadados */}
                <VStack align="flex-start" spacing={4} width="100%">
                  <Heading color="white" size="2xl" lineHeight={1.2}>
                    {content.name}
                  </Heading>
                  
                  <HStack spacing={6}>
                    <HStack 
                      spacing={2} 
                      bg="whiteAlpha.200" 
                      p={2} 
                      borderRadius="md"
                    >
                      <Icon as={FiStar} color="yellow.400" />
                      <Text color="white" fontWeight="bold">
                        {tmdbData?.vote_average?.toFixed(1) || '5.7'}/10
                      </Text>
                    </HStack>
                    
                    <Badge 
                      colorScheme="blue" 
                      fontSize="md" 
                      px={3} 
                      py={1}
                      bg="whiteAlpha.200"
                    >
                      {content.year || tmdbData?.release_date?.split('-')[0] || '1979'}
                    </Badge>
                    
                    <Badge 
                      colorScheme="purple" 
                      fontSize="md" 
                      px={3} 
                      py={1}
                      bg="whiteAlpha.200"
                    >
                      {content.duration || '2H 2MIN'}
                    </Badge>
                  </HStack>
                </VStack>

                {/* Descrição */}
                <Text 
                  color="gray.300" 
                  fontSize="lg" 
                  maxW="800px"
                  lineHeight="tall"
                  letterSpacing="wide"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {content.description || tmdbData?.overview}
                </Text>

                {/* Botões de Ação */}
                <HStack spacing={4} pt={6}>
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="red"
                    size="lg"
                    height="56px"
                    px={8}
                    onClick={handlePlay}
                  >
                    Assistir
                  </Button>
                  <IconButton
                    aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    icon={<FiHeart size={24} fill={isFavorite ? "currentColor" : "none"} />}
                    colorScheme={isFavorite ? "pink" : "whiteAlpha"}
                    variant={isFavorite ? "solid" : "outline"}
                    size="lg"
                    height="56px"
                    width="56px"
                    onClick={handleFavorite}
                    isDisabled={!isAuthenticated}
                    _hover={{
                      transform: "scale(1.05)",
                      bg: isFavorite ? "pink.600" : "whiteAlpha.300"
                    }}
                    transition="all 0.2s"
                  />
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Conteúdo Adicional */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Elenco e Equipe */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Elenco */}
            {tmdbData?.credits?.cast && tmdbData.credits.cast.length > 0 && (
              <Box>
                <Heading size="lg" color="white" mb={4}>
                  Elenco Principal
                </Heading>
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
                  {tmdbData.credits.cast.slice(0, 8).map(actor => (
                    <VStack 
                      key={actor.id}
                      bg="whiteAlpha.100"
                      p={4}
                      borderRadius="lg"
                      spacing={3}
                      align="center"
                    >
                      <Avatar
                        size="xl"
                        name={actor.name}
                        src={actor.profile_path 
                          ? TMDBService.getImageUrl(actor.profile_path, 'w185')
                          : undefined}
                      />
                      <VStack spacing={1} align="center">
                        <Text color="white" fontWeight="bold" textAlign="center">
                          {actor.name}
                        </Text>
                        <Text color="gray.400" fontSize="sm" textAlign="center">
                          {actor.character}
                        </Text>
                      </VStack>
                    </VStack>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Equipe Técnica */}
            {tmdbData?.credits?.crew && (
              <Box>
                <Heading size="lg" color="white" mb={4}>
                  Equipe Técnica
                </Heading>
                <SimpleGrid columns={1} spacing={4}>
                  {/* Diretor */}
                  {tmdbData.credits.crew
                    .filter(person => person.job === 'Director')
                    .map(director => (
                      <HStack 
                        key={director.id}
                        bg="whiteAlpha.100"
                        p={4}
                        borderRadius="lg"
                        spacing={4}
                      >
                        <Avatar
                          size="md"
                          name={director.name}
                          src={director.profile_path 
                            ? TMDBService.getImageUrl(director.profile_path, 'w185')
                            : undefined}
                        />
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="bold">
                            {director.name}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            Diretor
                          </Text>
                        </VStack>
                      </HStack>
                    ))}

                  {/* Roteiristas */}
                  {tmdbData.credits.crew
                    .filter(person => person.department === 'Writing')
                    .slice(0, 2)
                    .map(writer => (
                      <HStack 
                        key={writer.id}
                        bg="whiteAlpha.100"
                        p={4}
                        borderRadius="lg"
                        spacing={4}
                      >
                        <Avatar
                          size="md"
                          name={writer.name}
                          src={writer.profile_path 
                            ? TMDBService.getImageUrl(writer.profile_path, 'w185')
                            : undefined}
                        />
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="bold">
                            {writer.name}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {writer.job}
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                </SimpleGrid>
              </Box>
            )}
          </SimpleGrid>

          {/* Trailer */}
          {trailer && (
            <Box>
              <Heading size="lg" color="white" mb={4}>
                Trailer
              </Heading>
              <Box
                position="relative"
                paddingBottom="56.25%"
                height={0}
                overflow="hidden"
                borderRadius="lg"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="Trailer"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                  allowFullScreen
                />
              </Box>
            </Box>
          )}

          {/* Informações de Produção */}
          {(tmdbData?.production_companies?.length > 0 || 
            tmdbData?.production_countries?.length > 0 || 
            tmdbData?.budget || 
            tmdbData?.revenue) && (
            <Box>
              <Heading size="lg" color="white" mb={4}>
                Informações de Produção
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {/* Estúdios */}
                {tmdbData.production_companies?.length > 0 && (
                  <Box bg="whiteAlpha.100" p={4} borderRadius="lg">
                    <Text color="white" fontWeight="bold" mb={2}>
                      Estúdios
                    </Text>
                    <VStack align="start" spacing={1}>
                      {tmdbData.production_companies.map(company => (
                        <Text key={company.id} color="gray.300">
                          {company.name}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Países */}
                {tmdbData.production_countries?.length > 0 && (
                  <Box bg="whiteAlpha.100" p={4} borderRadius="lg">
                    <Text color="white" fontWeight="bold" mb={2}>
                      Países de Produção
                    </Text>
                    <VStack align="start" spacing={1}>
                      {tmdbData.production_countries.map(country => (
                        <Text key={country.iso_3166_1} color="gray.300">
                          {country.name}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Orçamento e Bilheteria */}
                {(tmdbData.budget > 0 || tmdbData.revenue > 0) && (
                  <Box bg="whiteAlpha.100" p={4} borderRadius="lg">
                    <Text color="white" fontWeight="bold" mb={2}>
                      Números
                    </Text>
                    <VStack align="start" spacing={1}>
                      {tmdbData.budget > 0 && (
                        <Text color="gray.300">
                          Orçamento: ${(tmdbData.budget / 1000000).toFixed(1)}M
                        </Text>
                      )}
                      {tmdbData.revenue > 0 && (
                        <Text color="gray.300">
                          Bilheteria: ${(tmdbData.revenue / 1000000).toFixed(1)}M
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </SimpleGrid>
            </Box>
          )}

          {/* Coleção */}
          {tmdbData?.belongs_to_collection && (
            <Box>
              <Heading size="lg" color="white" mb={4}>
                Parte da Coleção
              </Heading>
              <Box
                bg="whiteAlpha.100"
                p={4}
                borderRadius="lg"
                backgroundImage={tmdbData.belongs_to_collection.backdrop_path 
                  ? `url(${TMDBService.getImageUrl(tmdbData.belongs_to_collection.backdrop_path, 'original')})`
                  : undefined}
                backgroundSize="cover"
                backgroundPosition="center"
                position="relative"
                overflow="hidden"
                height="200px"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="rgba(0,0,0,0.7)"
                  backdropFilter="blur(5px)"
                />
                <VStack
                  position="relative"
                  height="100%"
                  justify="center"
                  spacing={2}
                >
                  <Text color="white" fontSize="2xl" fontWeight="bold" textAlign="center">
                    {tmdbData.belongs_to_collection.name}
                  </Text>
                </VStack>
              </Box>
            </Box>
          )}

          {/* Palavras-chave */}
          {tmdbData?.keywords?.keywords?.length > 0 && (
            <Box>
              <Heading size="lg" color="white" mb={4}>
                Temas e Palavras-chave
              </Heading>
              <Wrap spacing={2}>
                {tmdbData.keywords.keywords.map(keyword => (
                  <WrapItem key={keyword.id}>
                    <Badge 
                      colorScheme="gray"
                      variant="solid"
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {keyword.name}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}
        </VStack>
      </Container>

      {/* Content Tabs */}
      <Container maxW="container.xl" py={12}>
        <Tabs variant="line" colorScheme="red">
          <TabList borderBottomColor="whiteAlpha.200">
            <Tab color="white" _selected={{ color: 'red.500', borderColor: 'red.500' }}>SOBRE</Tab>
            <Tab color="white" _selected={{ color: 'red.500', borderColor: 'red.500' }}>ELENCO</Tab>
            <Tab color="white" _selected={{ color: 'red.500', borderColor: 'red.500' }}>DETALHES</Tab>
          </TabList>

          <TabPanels>
            {/* About Tab */}
            <TabPanel>
              <VStack align="stretch" spacing={6}>
                {/* Overview */}
                {tmdbData?.overview && (
                  <Box>
                    <Heading size="md" color="white" mb={4}>Sinopse</Heading>
                    <Text color="gray.300">{tmdbData.overview}</Text>
                  </Box>
                )}

                {/* Production Companies */}
                {tmdbData?.production_companies && tmdbData.production_companies.length > 0 && (
                  <Box>
                    <Heading size="md" color="white" mb={4}>Produção</Heading>
                    <Wrap spacing={4}>
                      {tmdbData.production_companies.map(company => (
                        <WrapItem key={company.id}>
                          <Badge colorScheme="whiteAlpha" padding={2}>
                            {company.name}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            {/* Cast Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={6}>
                {tmdbData?.credits?.cast?.slice(0, 12).map(actor => (
                  <VStack key={actor.id} spacing={2}>
                    <Avatar
                      size="2xl"
                      name={actor.name}
                      src={actor.profile_path 
                        ? TMDBService.getImageUrl(actor.profile_path, 'w185')
                        : undefined}
                    />
                    <Text color="white" fontWeight="bold" textAlign="center">
                      {actor.name}
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      {actor.character}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Details Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {/* Movie Info */}
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text color="gray.400">Status</Text>
                    <Text color="white">{tmdbData?.status}</Text>
                  </Box>
                  {tmdbData?.budget > 0 && (
                    <Box>
                      <Text color="gray.400">Orçamento</Text>
                      <Text color="white">
                        ${tmdbData.budget.toLocaleString()}
                      </Text>
                    </Box>
                  )}
                  {tmdbData?.revenue > 0 && (
                    <Box>
                      <Text color="gray.400">Receita</Text>
                      <Text color="white">
                        ${tmdbData.revenue.toLocaleString()}
                      </Text>
                    </Box>
                  )}
                </VStack>

                {/* Keywords */}
                {tmdbData?.keywords?.keywords && (
                  <Box>
                    <Heading size="md" color="white" mb={4}>Palavras-chave</Heading>
                    <Wrap spacing={2}>
                      {tmdbData.keywords.keywords.map(keyword => (
                        <WrapItem key={keyword.id}>
                          <Badge 
                            colorScheme="whiteAlpha" 
                            variant="solid" 
                            padding={2}
                          >
                            {keyword.name}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Loading State */}
      {loading && (
        <Container maxW="container.xl" py={8}>
          <VStack spacing={4}>
            <Skeleton height="40px" width="200px" />
            <Skeleton height="20px" width="100%" />
            <Skeleton height="20px" width="100%" />
          </VStack>
        </Container>
      )}
    </Box>
  );
}
