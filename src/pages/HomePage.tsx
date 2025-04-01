import React, { useEffect, useState, useMemo, Suspense, useCallback } from 'react';
import { Box, Container, VStack, useToast, Button, Text, Heading, Spinner } from '@chakra-ui/react';
import { EnhancedHeroBanner } from '../components/home/EnhancedHeroBanner';
import { ContentCarousel } from '../components/shared/ContentCarousel';
import { useIPTVStore } from '../store/iptvStore';
import { useAuthContext } from '../contexts/AuthContext';
import { FeaturedContent } from '../types/content';
import { supabase } from '../lib/supabase';

const ITEMS_PER_PAGE = 50; // Número de itens por página em cada categoria

const INITIAL_ITEMS = 20;

export function HomePage() {
  const toast = useToast();
  const { user } = useAuthContext();
  const { 
    movies, 
    series, 
    live, 
    loading: storeLoading,
    loadNextPage,
    setFeatured,
    error: storeError
  } = useIPTVStore();

  // Estado local
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredContent, setFeaturedContent] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Estado local para controlar o que está visível
  const [visibleMovies, setVisibleMovies] = useState<any[]>([]);
  const [visibleSeries, setVisibleSeries] = useState<any[]>([]);
  const [visibleLive, setVisibleLive] = useState<any[]>([]);

  // Função para extrair o nome base da série (removendo informações de episódio)
  const getSeriesBaseName = (name: string) => {
    return name
      .replace(/\s+S\d+\s*E\d+.*$/i, '') // Remove S01E01, etc
      .replace(/\s*\(\d{4}\)/, '')  // Remove o ano entre parênteses
      .trim();
  };

  // Função para extrair informações do episódio
  const getEpisodeInfo = (name: string) => {
    const match = name.match(/S(\d+)\s*E(\d+)/i);
    if (match) {
      return {
        season: parseInt(match[1]),
        episode: parseInt(match[2])
      };
    }
    return null;
  };

  // Função para agrupar episódios da mesma série
  const groupSeriesEpisodes = (items: any[]) => {
    // Primeiro, remover duplicatas exatas
    const uniqueItems = items.filter((item, index, self) =>
      index === self.findIndex((t) => t.name === item.name)
    );

    const groupedSeries = new Map();
    
    uniqueItems.forEach(item => {
      const baseName = getSeriesBaseName(item.name);
      const episodeInfo = getEpisodeInfo(item.name);
      
      if (!groupedSeries.has(baseName)) {
        groupedSeries.set(baseName, {
          ...item,
          name: baseName,
          episodeCount: 1,
          episodes: episodeInfo ? [episodeInfo] : [],
          latestEpisode: episodeInfo
        });
      } else {
        const existing = groupedSeries.get(baseName);
        if (episodeInfo && !existing.episodes.some(ep => 
          ep.season === episodeInfo.season && ep.episode === episodeInfo.episode
        )) {
          existing.episodeCount++;
          existing.episodes.push(episodeInfo);
          if (!existing.latestEpisode || 
              episodeInfo.season > existing.latestEpisode.season || 
              (episodeInfo.season === existing.latestEpisode.season && 
               episodeInfo.episode > existing.latestEpisode.episode)) {
            existing.latestEpisode = episodeInfo;
          }
        }
      }
    });

    return Array.from(groupedSeries.values());
  };

  interface BannerConfig {
    selectedGroups: string[];
    moviesPerGroup: number;
  }

  // Função para formatar URL da imagem
  const formatImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  // Função para formatar conteúdo
  const formatContent = (item: any) => {
    if (!item) return null;

    const logo = item.logo || item.thumbnailUrl || item.thumbnailPath || item.posterUrl || item.posterPath || '';
    
    return {
      type: item.type || 'movie',
      id: item.id || '',
      title: item.name || '',
      name: item.name || '',
      description: item.description || '',
      logo: formatImageUrl(logo),
      thumbnailUrl: formatImageUrl(item.thumbnailUrl || item.thumbnailPath || ''),
      posterUrl: formatImageUrl(item.posterUrl || item.posterPath || ''),
      backdropUrl: formatImageUrl(item.backdropUrl || item.backdropPath || ''),
      trailerUrl: item.trailerUrl || '',
      videoUrl: item.url || '',
      rating: item.rating || '',
      year: item.year || '',
      duration: item.duration || '',
      genres: item.genres || [],
      cast: item.cast || [],
      director: item.director || '',
      studio: item.studio || '',
      group: item.group || item.group_title || '',
      views: item.views || 0,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    };
  };

  // Função para formatar conteúdo com memoização
  const formatContentWithId = useCallback((item: any) => {
    if (!item) {
      console.warn('Tentativa de formatar item nulo ou indefinido');
      return null;
    }
    
    return formatContent({
      ...item,
      // Usar o ID já gerado pelo store
      id: item.id
    });
  }, []);

  // Memoizar os itens formatados
  const formattedMovies = useMemo(() => 
    movies.filter(Boolean).map(item => formatContentWithId(item)).filter(Boolean),
    [movies, formatContentWithId]
  );

  const formattedSeries = useMemo(() => 
    series.filter(Boolean).map(item => formatContentWithId(item)).filter(Boolean),
    [series, formatContentWithId]
  );

  const formattedLive = useMemo(() => 
    live.filter(Boolean).map(item => formatContentWithId(item)).filter(Boolean),
    [live, formatContentWithId]
  );

  // Selecionar conteúdo em destaque
  const selectFeaturedContent = useCallback((movies: any[], series: any[]) => {
    const potentialFeatured = [...movies, ...series]
      .filter(item => item.logo) // Apenas itens com imagem
      .sort(() => Math.random() - 0.5); // Ordem aleatória

    return potentialFeatured.slice(0, 5);
  }, []);

  // Carregar conteúdo inicial
  useEffect(() => {
    let mounted = true;

    const loadInitialContent = async () => {
      try {
        console.log('Iniciando carregamento de conteúdo...');
        
        // Se já temos conteúdo, apenas selecionar destaques
        if (movies.length > 0 || series.length > 0 || live.length > 0) {
          console.log('Conteúdo existente encontrado:', {
            movies: movies.length,
            series: series.length,
            live: live.length
          });
          
          // Selecionar conteúdo em destaque
          const selectedFeatured = selectFeaturedContent(movies, series);
          if (selectedFeatured.length > 0) {
            setFeaturedContent(selectedFeatured);
            setFeatured(selectedFeatured);
          }
          
          setInitialLoading(false);
          return;
        }

        console.log('Nenhum conteúdo encontrado, carregando da API...');
        // Se não temos conteúdo, carregar
        try {
          await loadNextPage();
        } catch (loadError) {
          console.error('Erro ao carregar próxima página:', loadError);
        }
        
        if (!mounted) return;

        // Verificar novamente se temos conteúdo após a tentativa de carregamento
        if (movies.length > 0 || series.length > 0 || live.length > 0) {
          console.log('Conteúdo carregado com sucesso após loadNextPage:', {
            movies: movies.length,
            series: series.length,
            live: live.length
          });
          
          // Selecionar conteúdo em destaque
          const selectedFeatured = selectFeaturedContent(movies, series);
          if (selectedFeatured.length > 0) {
            setFeaturedContent(selectedFeatured);
            setFeatured(selectedFeatured);
          }
          
          setInitialLoading(false);
          return;
        }

        // Se ainda não temos conteúdo, mostrar mensagem apropriada
        console.warn('Nenhum conteúdo carregado após loadNextPage');
        if (mounted) {
          setError('Não foi possível carregar o conteúdo. Por favor, tente novamente.');
        }

      } catch (err) {
        console.error('Erro detalhado:', err);
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar conteúdo';
          setError(errorMessage);
          toast({
            title: 'Erro ao carregar conteúdo',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    };

    loadInitialContent();

    return () => {
      mounted = false;
    };
  }, [movies, series, live, loadNextPage, selectFeaturedContent, setFeatured, toast]);

  // Gerenciar paginação do conteúdo
  useEffect(() => {
    const start = 0;
    const end = ITEMS_PER_PAGE * currentPage;

    setVisibleMovies(formattedMovies.slice(start, end));
    setVisibleSeries(formattedSeries.slice(start, end));
    setVisibleLive(formattedLive.slice(start, end));
  }, [formattedMovies, formattedSeries, formattedLive, currentPage]);

  // Implementar infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        setCurrentPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memorizar estado do conteúdo
  const contentState = useMemo(() => ({
    hasMovies: movies.length > 0,
    hasSeries: series.length > 0,
    hasLive: live.length > 0,
    isEmpty: !storeLoading && movies.length === 0 && series.length === 0 && live.length === 0
  }), [movies.length, series.length, live.length, storeLoading]);

  // Pegar apenas os primeiros N itens de cada categoria
  const limitedMovies = useMemo(() => movies.slice(0, INITIAL_ITEMS), [movies]);
  const limitedSeries = useMemo(() => series.slice(0, INITIAL_ITEMS), [series]);
  const limitedLive = useMemo(() => live.slice(0, INITIAL_ITEMS), [live]);

  // Renderizar loading state
  if (initialLoading || storeLoading) {
    console.log('Renderizando estado de loading...');
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Carregando conteúdo...</Text>
        </VStack>
      </Box>
    );
  }

  // Mostrar erro se houver
  if (error || storeError) {
    return (
      <Box minH="100vh" p={4}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="stretch">
            <Box p={4} bg="red.50" color="red.500" borderRadius="md">
              <Heading size="md" mb={2}>Erro ao carregar conteúdo</Heading>
              <Text>{error || storeError}</Text>
              <Button
                mt={4}
                colorScheme="red"
                onClick={() => {
                  // Tentar carregar novamente
                  setError(null);
                  loadNextPage();
                  setInitialLoading(true);
                  
                  // Definir um timeout para evitar loading infinito
                  setTimeout(() => {
                    setInitialLoading(false);
                  }, 5000);
                }}
              >
                Tentar Novamente
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Renderizar estado vazio - Modificado para mostrar um botão de tentar novamente
  if (contentState.isEmpty) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
        <Text fontSize="xl" mb={4}>Nenhum conteúdo disponível</Text>
        <Button 
          colorScheme="blue"
          onClick={() => {
            setInitialLoading(true);
            loadNextPage().finally(() => {
              setInitialLoading(false);
            });
          }}
        >
          Carregar Conteúdo
        </Button>
      </Box>
    );
  }

  console.log('Renderizando conteúdo:', {
    movies: formattedMovies.length,
    series: formattedSeries.length,
    live: formattedLive.length,
    featured: featuredContent.length
  });

  // Renderizar conteúdo
  return (
    <Box minH="100vh" bg="gray.900">
      {featuredContent?.[0] && (
        <EnhancedHeroBanner content={featuredContent[0]} />
      )}

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {contentState.hasMovies && (
            <Suspense fallback={<Spinner />}>
              <ContentCarousel
                title="Filmes"
                items={limitedMovies}
                type="movie"
              />
            </Suspense>
          )}

          {contentState.hasSeries && (
            <Suspense fallback={<Spinner />}>
              <ContentCarousel
                title="Séries"
                items={limitedSeries}
                type="series"
              />
            </Suspense>
          )}

          {contentState.hasLive && (
            <Suspense fallback={<Spinner />}>
              <ContentCarousel
                title="TV Ao Vivo"
                items={limitedLive}
                type="live"
              />
            </Suspense>
          )}

          {(!formattedMovies?.length && !formattedSeries?.length && !formattedLive?.length) && (
            <Box textAlign="center" py={8}>
              <Text color="white">Nenhum conteúdo disponível no momento.</Text>
              <Button
                mt={4}
                colorScheme="blue"
                onClick={() => loadNextPage()}
              >
                Carregar Mais Conteúdo
              </Button>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
