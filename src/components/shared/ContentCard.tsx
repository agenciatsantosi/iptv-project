import React, { useState, useCallback, useEffect } from 'react';
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

export const ContentCard = React.memo(({ content }: ContentCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, favorites } = useIPTVStore();
  const { isAuthenticated } = useAuthContext();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tmdbFallbackTried, setTmdbFallbackTried] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  // Função para tentar diferentes fontes de imagem em ordem
  const getInitialImageUrl = useCallback(() => {
    const possibleSources = [
      content.logo,
      content.posterUrl,
      content.thumbnailUrl,
      content.backdrop
    ];

    return possibleSources.find(url => url && typeof url === 'string') || null;
  }, [content]);

  // Carregar imagem inicial
  useEffect(() => {
    const initialUrl = getInitialImageUrl();
    if (initialUrl) {
      setImageUrl(initialUrl);
    } else {
      handleImageError();
    }
  }, [content, getInitialImageUrl]);

  // Função para tentar buscar imagem do TMDB
  const tryTMDBFallback = useCallback(async () => {
    if (tmdbFallbackTried || !content.title) return;
    
    setTmdbFallbackTried(true);
    setIsLoading(true);

    try {
      const tmdbUrl = await getMediaImage(content.title, content.type || 'movie');
      if (tmdbUrl) {
        setImageUrl(tmdbUrl);
        setIsLoading(false);
      } else {
        setImageUrl(DEFAULT_POSTER);
      }
    } catch (error) {
      console.error('Erro ao buscar imagem do TMDB:', error);
      setImageUrl(DEFAULT_POSTER);
    } finally {
      setIsLoading(false);
    }
  }, [content.title, content.type, tmdbFallbackTried]);

  const handleImageError = async () => {
    console.warn('Erro ao carregar imagem:', content.title || content.name || 'Sem título');
    
    // Se ainda não tentou TMDB, tenta
    if (!tmdbFallbackTried) {
      await tryTMDBFallback();
    } else {
      // Se já tentou TMDB, usa placeholder
      setImageUrl(DEFAULT_POSTER);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login Necessário",
        description: "Faça login para assistir este conteúdo",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    navigate(`/watch/${content.id}`);
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/content/${content.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login Necessário",
        description: "Faça login para adicionar aos favoritos",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    toggleFavorite(content.id);
  };

  // Garantir que temos um título
  const title = content.title || content.name || 'Sem título';

  const episodeCount = content.episodes?.length;
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
        bg="blackAlpha.800"
        align="flex-start"
        spacing={1}
      >
        <Text
          color="white"
          fontSize="sm"
          fontWeight="bold"
          noOfLines={2}
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
