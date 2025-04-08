import React, { useEffect, useState, useMemo, Suspense, useCallback } from 'react';
import { Box, Container, VStack, useToast, Button, Text, Heading, Spinner, Flex } from '@chakra-ui/react';
import { EnhancedHeroBanner } from '../components/home/EnhancedHeroBanner';
import { ContentCarousel } from '../components/shared/ContentCarousel';
import { SocialMediaBanner } from '../components/shared/SocialMediaBanner';
import { useIPTVStore } from '../store/iptvStore';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FeaturedBanner } from '../components/Banner/FeaturedBanner';
import type { FeaturedContent } from '../types/content';

const ITEMS_PER_PAGE = 50; // Número de itens por página em cada categoria
const INITIAL_ITEMS = 20;
const CACHE_KEYS = ['channels_cache', 'channels_cache_v3']; // Chaves de cache para limpar

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
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
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
        if (episodeInfo && !existing.episodes.some((ep: { season: number; episode: number }) => 
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

  // Função para formatar URL da imagem
  const formatImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  // Função para formatar conteúdo
  const formatContent = (item: any): FeaturedContent => {
    if (!item) {
      // Retornar um objeto vazio que satisfaz o tipo FeaturedContent
      return {
        id: '',
        title: '',
        type: 'movie',
        description: '',
        posterUrl: '',
        backdropUrl: '',
        trailerUrl: '',
        rating: 0,
        year: 0,
        duration: '',
        genres: [],
        cast: [],
        director: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    const logo = item.logo || item.thumbnailUrl || item.thumbnailPath || item.posterUrl || item.posterPath || '';
    
    // Tentar extrair o título de várias propriedades possíveis
    const title = item.title || item.name || '';
    
    // Formatar URLs para garantir que são válidas
    const posterUrl = formatImageUrl(logo);
    const thumbnailUrl = formatImageUrl(item.thumbnailUrl || item.thumbnailPath || '');
    const backdropUrl = formatImageUrl(item.backdropUrl || item.backdropPath || '');
    
    return {
      type: item.type,
      id: item.id,
      title: title,
      name: item.name,
      description: item.description || item.overview || '',
      logo: posterUrl,
      thumbnailUrl: thumbnailUrl,
      posterUrl: posterUrl,
      backdropUrl: backdropUrl,
      trailerUrl: item.trailerUrl || '',
      videoUrl: item.url || '',
      rating: item.rating || item.vote_average || 0,
      year: item.year || item.release_date || item.first_air_date || '',
      duration: item.duration || item.runtime || '',
      genres: item.genres || [],
      cast: item.cast || [],
      director: item.director || '',
      episodes: item.episodes || [],
      episodeCount: item.episodeCount || 0,
      group: item.group || item.group_title || '',
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date()
    };
  };

  // Função para formatar conteúdo com memoização
  const formatContentWithId = useCallback((item: any): FeaturedContent => {
    if (!item) {
      console.warn('Tentativa de formatar item nulo ou indefinido');
      return {
        id: '',
        title: '',
        type: 'movie',
        description: '',
        posterUrl: '',
        backdropUrl: '',
        trailerUrl: '',
        rating: 0,
        year: 0,
        duration: '',
        genres: [],
        cast: [],
        director: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
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
    let retryCount = 0;
    const maxRetries = 3;
    
    // Verificar se já temos conteúdo carregado
    if (initialLoading === false && (movies.length > 0 || series.length > 0 || live.length > 0)) {
      console.log('Conteúdo já carregado, ignorando carregamento adicional');
      return;
    }

    // Função para selecionar conteúdo em destaque
    const selectFeaturedContent = (movies: any[], series: any[]) => {
      const allContent = [...movies, ...series].filter(item => 
        item.thumbnailUrl || item.posterUrl || item.logo || item.thumbnailPath
      );
      
      // Ordenar aleatoriamente e pegar os primeiros 5
      return allContent
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(formatContent);
    };

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
        
        // Definir um timeout para evitar bloqueio infinito
        const loadPromise = loadNextPage();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar conteúdo')), 15000)
        );
        
        try {
          await Promise.race([loadPromise, timeoutPromise]);
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

        // Se ainda não temos conteúdo e ainda temos tentativas disponíveis, tentar novamente
        if (retryCount < maxRetries) {
          console.log(`Tentativa ${retryCount + 1} de ${maxRetries} falhou. Tentando novamente em 2 segundos...`);
          retryCount++;
          
          // Tentar novamente após um pequeno delay
          setTimeout(() => {
            if (mounted) {
              loadInitialContent();
            }
          }, 2000);
          return;
        }

        // Se esgotamos as tentativas, mostrar mensagem apropriada
        console.warn('Nenhum conteúdo carregado após múltiplas tentativas');
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
        if (mounted && retryCount >= maxRetries) {
          setInitialLoading(false);
        }
      }
    };

    // Iniciar carregamento
    loadInitialContent();

    return () => {
      mounted = false;
    };
  }, [movies.length, series.length, live.length, loadNextPage, initialLoading, toast, setFeatured]);

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

  // Pegar apenas os primeiros N itens de cada categoria
  const limitedMovies = useMemo(() => movies.slice(0, INITIAL_ITEMS), [movies]);
  
  // Agrupar séries para mostrar séries diferentes em vez de episódios
  const groupedSeries = useMemo(() => {
    // Usar a função de agrupamento para garantir que cada série apareça apenas uma vez
    const grouped = groupSeriesEpisodes(series);
    console.log('Séries agrupadas:', grouped.length);
    return grouped.slice(0, INITIAL_ITEMS);
  }, [series]);
  
  const limitedLive = useMemo(() => live.slice(0, INITIAL_ITEMS), [live]);

  // Formatar conteúdo para exibição
  const formattedContent = useMemo(() => {
    // Filtrar e formatar canais ao vivo
    const filteredLive = live.filter(channel => {
      // Excluir especificamente a série 1883 da seção de TV ao vivo
      if (channel.name.toLowerCase().includes('1883')) {
        console.log('Excluindo 1883 da seção de TV ao vivo:', channel.name);
        return false;
      }
      
      // Permitir todos os outros canais ao vivo
      return true;
    });

    console.log(`Canais ao vivo após filtro: ${filteredLive.length} de ${live.length}`);

    return {
      movies: limitedMovies.map(formatContentWithId),
      series: groupedSeries.map(formatContentWithId),
      live: filteredLive.map(formatContentWithId),
    };
  }, [limitedMovies, groupedSeries, live, formatContentWithId]);

  // Verificar o estado do conteúdo
  const contentState = useMemo(() => {
    const hasMovies = formattedContent.movies.length > 0;
    const hasSeries = formattedContent.series.length > 0;
    const hasLive = live.length > 0; // Usar o array original de live para verificar se existem canais
    const isEmpty = !storeLoading && formattedContent.movies.length === 0 && formattedContent.series.length === 0 && formattedContent.live.length === 0;

    console.log('Estado do conteúdo:', {
      hasMovies,
      hasSeries,
      hasLive,
      liveCount: formattedContent.live.length,
      totalLive: live.length,
      isEmpty
    });

    return {
      hasMovies,
      hasSeries,
      hasLive,
      isEmpty
    };
  }, [formattedContent, storeLoading, live.length]);

  // Função para limpar o cache e recarregar os canais
  const handleClearCache = useCallback(() => {
    // Limpar cache de canais
    Object.keys(localStorage).forEach(key => {
      if (CACHE_KEYS.some(cacheKey => key.startsWith(cacheKey))) {
        localStorage.removeItem(key);
      }
    });
    
    toast({
      title: 'Cache limpo',
      description: 'O cache foi limpo com sucesso. Recarregando canais...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Recarregar a página para aplicar as alterações
    window.location.reload();
  }, [toast]);

  // Renderizar componente de erro
  const renderError = () => (
    <Box 
      width="100%" 
      textAlign="center" 
      py={20}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
    >
      <Heading as="h2" size="xl" mb={4} color="red.500">
        Erro ao carregar conteúdo
      </Heading>
      <Text fontSize="lg" mb={6}>
        {error || 'Não foi possível carregar o conteúdo. Por favor, tente novamente.'}
      </Text>
      <Button 
        colorScheme="red" 
        size="lg"
        onClick={() => {
          setError(null);
          setInitialLoading(true);
          loadNextPage();
        }}
      >
        Tentar Novamente
      </Button>
    </Box>
  );

  // Renderizar componente de carregamento
  const renderLoading = () => (
    <Box 
      width="100%" 
      textAlign="center" 
      py={20}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
    >
      <Spinner size="xl" color="red.500" mb={4} />
      <Text fontSize="lg">Carregando conteúdo...</Text>
    </Box>
  );

  // Renderizar conteúdo principal
  if (initialLoading || storeLoading) {
    return renderLoading();
  }

  // Mostrar erro se houver
  if (error || storeError) {
    return renderError();
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
    movies: formattedContent.movies.length,
    series: formattedContent.series.length,
    live: formattedContent.live.length,
    featured: featuredContent.length
  });

  // Renderizar conteúdo
  return (
    <Box minH="100vh" bg="black">
      {featuredContent?.[0] && (
        <EnhancedHeroBanner content={featuredContent[0]} />
      )}

      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          
          {contentState.hasMovies && (
            <Suspense fallback={<Spinner />}>
              <Box className="content-section">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="lg" fontWeight="bold" color="white">Filmes Recomendado</Text>
                  <Text fontSize="sm" color="yellow.400" cursor="pointer">
                    Ver mais
                  </Text>
                </Flex>
                <ContentCarousel
                  items={formattedContent.movies}
                  type="movie"
                  fixedLayout={true}
                />
              </Box>
            </Suspense>
          )}

          {contentState.hasSeries && (
            <Suspense fallback={<Spinner />}>
              <Box className="content-section">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="lg" fontWeight="bold" color="white">Séries Recomendado</Text>
                  <Text fontSize="sm" color="yellow.400" cursor="pointer">
                    Ver mais
                  </Text>
                </Flex>
                <ContentCarousel
                  items={formattedContent.series}
                  type="series"
                  fixedLayout={true}
                />
              </Box>
            </Suspense>
          )}

          {contentState.hasLive && (
            <Suspense fallback={<Spinner />}>
              <Box className="content-section">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="lg" fontWeight="bold" color="white">TV Ao Vivo</Text>
                  <Text fontSize="sm" color="yellow.400" cursor="pointer">
                    Ver mais
                  </Text>
                </Flex>
                {formattedContent.live.length > 0 ? (
                  <ContentCarousel
                    items={formattedContent.live}
                    type="live"
                    fixedLayout={true}
                  />
                ) : (
                  <Box 
                    p={6} 
                    bg="gray.800" 
                    borderRadius="md" 
                    textAlign="center"
                  >
                    <Text mb={4}>Nenhum canal de TV ao vivo disponível no momento.</Text>
                    <Button 
                      colorScheme="blue" 
                      size="sm"
                      onClick={() => {
                        // Limpar cache e recarregar
                        Object.keys(localStorage).forEach(key => {
                          if (key.includes('channels_cache')) {
                            localStorage.removeItem(key);
                          }
                        });
                        window.location.reload();
                      }}
                    >
                      Tentar Novamente
                    </Button>
                  </Box>
                )}
              </Box>
            </Suspense>
          )}

          {/* Banner do SocialMedia */}
          <SocialMediaBanner title="Participe das nossas redes sociais" />

          {(!formattedContent.movies?.length && !formattedContent.series?.length && !formattedContent.live?.length) && (
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
