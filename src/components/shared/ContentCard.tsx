import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Image,
  Text,
  Badge,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useIPTVStore } from '../../store/iptvStore';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '@chakra-ui/react';
import { getMediaImage } from '../../services/tmdb';

const MotionBox = motion(Box);

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    name?: string;
    logo?: string;
    posterUrl?: string;
    thumbnailUrl?: string;
    backdropUrl?: string;
    type: 'movie' | 'series' | 'live';
    rating?: string | number;
    year?: number | string;
    duration?: string;
    episodeCount?: number;
    latestEpisode?: string;
    group?: string;
    group_title?: string;
    description?: string;
    url?: string;
  };
}

const DEFAULT_POSTER = '/placeholder-poster.jpg';

// Cache local para evitar múltiplas requisições para o mesmo título
const tmdbImageCache: Record<string, string> = {};

export const ContentCard = React.memo(({ content }: ContentCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, favorites } = useIPTVStore();
  const { isAuthenticated } = useAuthContext();
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_POSTER);
  const [isLoading, setIsLoading] = useState(true);
  const [tmdbFallbackTried, setTmdbFallbackTried] = useState(false);
  const toast = useToast();
  const imageErrorCount = useRef(0);
  const isMounted = useRef(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  // Limpar estado quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Função para tentar diferentes fontes de imagem em ordem
  const getInitialImageUrl = useCallback(() => {
    const possibleSources = [
      content.logo,
      content.posterUrl,
      content.thumbnailUrl,
      content.backdropUrl
    ];

    // Filtrar apenas URLs válidas
    const validSources = possibleSources.filter(url => 
      url && 
      typeof url === 'string' && 
      (url.startsWith('http') || url.startsWith('/'))
    );

    return validSources[0] || DEFAULT_POSTER;
  }, [content]);

  // Carregar imagem inicial
  useEffect(() => {
    // Resetar contadores quando o conteúdo mudar
    imageErrorCount.current = 0;
    setTmdbFallbackTried(false);
    
    const initialUrl = getInitialImageUrl();
    setImageUrl(initialUrl);
    
    // Se a URL inicial for o poster padrão, tentar TMDB imediatamente
    if (initialUrl === DEFAULT_POSTER && content.title) {
      tryTMDBFallback();
    }
  }, [content, getInitialImageUrl]);

  // Função para tentar buscar imagem do TMDB
  const tryTMDBFallback = useCallback(async () => {
    if (tmdbFallbackTried || !content.title) {
      // Se já tentou ou não tem título, usar placeholder diretamente
      setImageUrl(DEFAULT_POSTER);
      setIsLoading(false);
      return;
    }
    
    setTmdbFallbackTried(true);
    setIsLoading(true);

    try {
      // Verificar cache primeiro
      const cacheKey = `${content.title}-${content.type}`;
      if (tmdbImageCache[cacheKey]) {
        setImageUrl(tmdbImageCache[cacheKey]);
        setIsLoading(false);
        return;
      }
      
      // Mapear o tipo para o formato esperado pelo TMDB
      // Usar apenas 'movie' ou 'tv' para compatibilidade com a API do TMDB
      const tmdbType = content.type === 'series' ? 'tv' : 'movie';
      
      // Limitar tempo de espera para 5 segundos
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao buscar imagem')), 5000);
      });
      
      // Usar Promise.race para limitar o tempo de espera
      const tmdbUrl = await Promise.race([
        getMediaImage(content.title, tmdbType),
        timeoutPromise
      ]);
      
      // Verificar se o componente ainda está montado
      if (!isMounted.current) return;
      
      if (tmdbUrl) {
        // Salvar no cache
        tmdbImageCache[cacheKey] = tmdbUrl;
        setImageUrl(tmdbUrl);
      } else {
        setImageUrl(DEFAULT_POSTER);
      }
    } catch (error) {
      console.error('Erro ao buscar imagem do TMDB:', error);
      
      // Verificar se o componente ainda está montado
      if (!isMounted.current) return;
      
      setImageUrl(DEFAULT_POSTER);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [content.title, content.type, tmdbFallbackTried]);

  const handleImageError = async () => {
    // Incrementar contador de erros
    imageErrorCount.current += 1;
    
    // Limitar número de tentativas para evitar loops infinitos
    if (imageErrorCount.current > 2) {
      console.warn('Muitas tentativas de carregamento de imagem para:', content.title || content.name || 'Sem título');
      setImageUrl(DEFAULT_POSTER);
      setIsLoading(false);
      return;
    }
    
    // Evitar log excessivo, apenas registrar o nome do conteúdo
    console.warn('Erro ao carregar imagem:', content.title || content.name || 'Sem título');
    
    // Limitar tentativas de carregamento
    if (tmdbFallbackTried) {
      // Se já tentou TMDB, usar placeholder imediatamente
      setImageUrl(DEFAULT_POSTER);
      setIsLoading(false);
    } else {
      // Tentar TMDB apenas uma vez
      tryTMDBFallback();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: 'Acesso restrito',
        description: 'Você precisa estar logado para assistir',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    navigate(`/watch/${content.type}/${content.id}`);
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${content.type}/${content.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: 'Acesso restrito',
        description: 'Você precisa estar logado para adicionar aos favoritos',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    toggleFavorite(content.id);
  };

  // Garantir que temos um título
  const title = content.title || content.name || 'Sem título';

  const episodeCount = content.episodeCount;
  const isSeries = content.type === 'series' && episodeCount;

  return (
    <MotionBox
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      cursor="pointer"
      bg={bgColor}
      rounded="lg"
      overflow="hidden"
      shadow="lg"
      position="relative"
      minW={{ base: '150px', md: '200px', lg: '250px' }}
      height="100%"
    >
      <Skeleton
        isLoaded={!isLoading}
        height={{ base: '225px', md: '300px', lg: '375px' }}
        width="100%"
        borderRadius="md"
        startColor="gray.800"
        endColor="gray.700"
      >
        <Box
          position="relative"
          height={{ base: '225px', md: '300px', lg: '375px' }}
          width="100%"
          overflow="hidden"
          borderRadius="md"
        >
          <Image
            src={imageUrl || DEFAULT_POSTER}
            alt={title}
            width="100%"
            height="100%"
            objectFit="cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            fallback={
              <Box
                height="100%"
                width="100%"
                bg="gray.700"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="gray.400" fontSize="sm">
                  {title}
                </Text>
              </Box>
            }
          />
        </Box>
      </Skeleton>

      {/* Overlay com botões */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="blackAlpha.600"
        opacity="0"
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={4}
      >
        <HStack spacing={2}>
          <IconButton
            aria-label="Play"
            icon={<Play />}
            onClick={handlePlay}
            colorScheme="blue"
            rounded="full"
            size="lg"
          />
          <IconButton
            aria-label="Informações"
            icon={<FaInfoCircle />}
            onClick={handleDetails}
            colorScheme="gray"
            rounded="full"
          />
          <IconButton
            aria-label="Favoritar"
            icon={<Heart fill={favorites?.includes(content.id) ? 'red' : 'none'} />}
            onClick={handleToggleFavorite}
            colorScheme={favorites?.includes(content.id) ? 'red' : 'gray'}
            rounded="full"
          />
        </HStack>
      </Box>

      {/* Informações do conteúdo */}
      <VStack
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        p={4}
        bg="blackAlpha.900"
        align="flex-start"
        spacing={1}
        borderBottomRadius="lg"
        boxShadow="0px -4px 6px rgba(0, 0, 0, 0.3)"
      >
        <Text
          color="white"
          fontSize="lg"
          fontWeight="bold"
          noOfLines={2}
          textShadow="1px 1px 2px rgba(0,0,0,0.8)"
        >
          {title}
        </Text>

        <HStack spacing={2} flexWrap="wrap">
          {content.type && (
            <Badge colorScheme={content.type === 'live' ? 'red' : content.type === 'series' ? 'blue' : 'green'}>
              {content.type === 'live' ? 'AO VIVO' : content.type === 'series' ? 'SÉRIE' : 'FILME'}
            </Badge>
          )}
          {isSeries && (
            <Badge colorScheme="purple">
              {episodeCount} episódio{episodeCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {content.year && (
            <Badge colorScheme="gray">{content.year}</Badge>
          )}
          {content.rating && (
            <Badge colorScheme="yellow">{content.rating}</Badge>
          )}
          {content.group_title && (
            <Badge colorScheme="purple" variant="subtle">
              {content.group_title}
            </Badge>
          )}
        </HStack>
      </VStack>
    </MotionBox>
  );
});

ContentCard.displayName = 'ContentCard';
