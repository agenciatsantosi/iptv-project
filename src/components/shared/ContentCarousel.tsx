import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text, HStack, VStack, Flex, Image } from '@chakra-ui/react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useNavigate } from 'react-router-dom';

interface FeaturedContent {
  id: number | string;
  title: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  rating?: number | string;
  year?: string;
  type: string;
}

export interface ContentCarouselProps {
  title?: string;
  items: FeaturedContent[];
  type: 'movie' | 'series' | 'live';
  fixedLayout?: boolean;
}

export function ContentCarousel({ title, items = [], type = 'movie', fixedLayout = false }: ContentCarouselProps) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { width: windowWidth } = useWindowSize();

  // Calcular número de itens visíveis baseado na largura da tela
  const itemsPerView = useMemo(() => {
    if (!windowWidth) return 4;
    return Math.floor((windowWidth - 32) / (180 + 16));
  }, [windowWidth]);

  // Pegar apenas os primeiros N itens para renderização inicial
  const visibleItems = useMemo(() => {
    return items.slice(0, 10);
  }, [items]);

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (itemId: string | number) => {
    setImageErrors(prev => ({ ...prev, [itemId.toString()]: true }));
  };

  // Função para obter URL da imagem com fallbacks
  const getImageUrl = (item: FeaturedContent) => {
    if (imageErrors[item.id.toString()]) {
      // Se a imagem original falhou, usar fallback
      return '/assets/images/placeholder.jpg';
    }
    
    // Tentar usar a URL original
    return item.posterUrl || item.thumbnailUrl || '/assets/images/placeholder.jpg';
  };

  if (!items.length) {
    return null;
  }

  return (
    <Box mb={6}>
      {title && (
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="xl" fontWeight="bold" color="white">
            {title}
          </Text>
          <Text fontSize="sm" color="yellow.400" cursor="pointer">
            Ver mais
          </Text>
        </Flex>
      )}

      <Box overflowX="auto" css={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        'scrollbarWidth': 'none'
      }}>
        <HStack spacing={3} pb={2}>
          {visibleItems.map(item => (
            <Box
              key={item.id}
              flex={`0 0 180px`}
              maxW={`180px`}
              bg="#111"
              borderRadius="md"
              overflow="hidden"
              transition="transform 0.2s"
              _hover={{
                transform: 'scale(1.05)',
                zIndex: 1
              }}
              onClick={() => {
                if (type === 'movie') navigate(`/movie/${item.id}`);
                if (type === 'series') navigate(`/series/${item.id}`);
                if (type === 'live') navigate(`/watch/live/${item.id}`);
              }}
              cursor="pointer"
            >
              <Box position="relative" pb="150%">
                <Image 
                  src={getImageUrl(item)} 
                  alt={item.title}
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  onError={() => handleImageError(item.id)}
                  fallback={
                    <Box 
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      bg="gray.800"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="sm"
                      textAlign="center"
                      p={2}
                    >
                      {item.title}
                    </Box>
                  }
                />
                {item.year && (
                  <Box 
                    position="absolute" 
                    top="8px" 
                    left="8px" 
                    bg="blackAlpha.700"
                    px={2}
                    py={1}
                    borderRadius="sm"
                  >
                    <Text fontSize="xs" color="white">{item.year}</Text>
                  </Box>
                )}
              </Box>
              <VStack align="start" p={2} spacing={0}>
                <Text 
                  fontSize="sm" 
                  fontWeight="medium" 
                  color="white" 
                  noOfLines={1}
                >
                  {item.title}
                </Text>
                {item.rating && (
                  <Text 
                    fontSize="xs" 
                    color="#FFCC00" 
                    fontWeight="bold"
                  >
                    TMDB {item.rating}
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}
