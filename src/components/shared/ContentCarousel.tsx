import React, { useMemo } from 'react';
import { Box, Text, HStack } from '@chakra-ui/react';
import { ContentCard } from './ContentCard';
import { useWindowSize } from '../../hooks/useWindowSize';

interface ContentCarouselProps {
  title: string;
  items: any[];
  type?: 'movie' | 'series' | 'live';
}

const ITEMS_TO_SHOW = 10; // Número de itens visíveis por vez
const ITEM_WIDTH = 200; // Largura base do item
const ITEM_GAP = 16; // Espaço entre itens

export const ContentCarousel = React.memo(({ title, items = [], type = 'movie' }: ContentCarouselProps) => {
  const { width: windowWidth } = useWindowSize();
  
  // Calcular número de itens visíveis baseado na largura da tela
  const itemsPerView = useMemo(() => {
    if (!windowWidth) return 4;
    return Math.floor((windowWidth - 32) / (ITEM_WIDTH + ITEM_GAP));
  }, [windowWidth]);

  // Pegar apenas os primeiros N itens para renderização inicial
  const visibleItems = useMemo(() => {
    return items.slice(0, ITEMS_TO_SHOW);
  }, [items]);

  if (!items.length) {
    return null;
  }

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>{title}</Text>
      <Box
        overflowX="auto"
        css={{
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <HStack spacing={4} py={2}>
          {visibleItems.map(item => (
            <Box
              key={item.id}
              flex={`0 0 ${ITEM_WIDTH}px`}
              maxW={`${ITEM_WIDTH}px`}
            >
              <ContentCard content={item} />
            </Box>
          ))}
        </HStack>
      </Box>
    </Box>
  );
});

ContentCarousel.displayName = 'ContentCarousel';
