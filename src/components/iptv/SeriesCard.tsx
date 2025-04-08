import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIPTVStore } from '../../store/iptvStore';
import { IconButton, Badge, Spinner, Box, Text, Flex, Image } from '@chakra-ui/react';
import { FiPlay, FiHeart } from 'react-icons/fi';
import { Channel } from '../../types/iptv';

interface SeriesCardProps {
  series: {
    id: string;
    name: string;
    title?: string;
    episodes: Channel[];
    seasons: number;
    group?: string;
    group_title?: string;
    logo?: string | null;
  };
}

export function SeriesCard({ series }: SeriesCardProps) {
  const { user } = useAuthContext();
  const { toggleFavorite, favorites } = useIPTVStore();
  const isFavorite = favorites.includes(series.id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Obter o número de episódios e temporadas
  const episodeCount = series.episodes?.length || 0;
  const seasonCount = series.seasons || 0;

  // Função para preparar e navegar para a página de detalhes
  const handleSeriesClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Impede o comportamento padrão do Link
    
    // Normaliza o nome para criar o slug
    const seriesName = series.title || series.name;
    const seriesSlug = seriesName
      .toLowerCase()
      .replace(/[^\w\s-]+/g, '')
      .trim()
      .replace(/\s+/g, '-');
    
    setIsLoading(true);
    
    try {
      // Navegação direta para a página da série usando o ID
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/series/${seriesSlug}`);
      }, 300);
    } catch (error) {
      console.error(`Erro ao navegar para série ${seriesName}:`, error);
      setIsLoading(false);
      // Mesmo com erro, tenta navegar
      navigate(`/series/${seriesSlug}`);
    }
  };

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = () => {
    setImageError(true);
  };

  // Obter URL da imagem com fallback
  const getImageUrl = () => {
    if (imageError) {
      return '/assets/images/placeholder.svg';
    }
    return series.logo || '/assets/images/placeholder.svg';
  };

  return (
    <Box 
      position="relative"
      borderRadius="md"
      overflow="hidden"
      bg="#111"
      transition="transform 0.2s"
      _hover={{
        transform: 'scale(1.05)',
        zIndex: 1
      }}
      cursor="pointer"
      onClick={handleSeriesClick}
    >
      <Box position="relative" pb="150%">
        <Image
          src={getImageUrl()}
          alt={series.title || series.name}
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          objectFit="cover"
          onError={handleImageError}
        />
        
        {/* Overlay para informações e botões */}
        <Box 
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)"
          opacity="0"
          transition="opacity 0.3s"
          _groupHover={{ opacity: 1 }}
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          p={3}
        >
          {/* Badge com número de temporadas no canto superior esquerdo */}
          {seasonCount > 0 && (
            <Badge 
              colorScheme="purple" 
              bg="purple.600"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              position="absolute"
              top="2"
              left="2"
              zIndex={1}
            >
              {seasonCount} {seasonCount === 1 ? 'temporada' : 'temporadas'}
            </Badge>
          )}
          
          {/* Badge com número de episódios no canto inferior esquerdo */}
          {episodeCount > 0 && (
            <Badge 
              colorScheme="blue" 
              bg="blue.600"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              position="absolute"
              bottom="2"
              left="2"
              zIndex={1}
            >
              {episodeCount} {episodeCount === 1 ? 'episódio' : 'episódios'}
            </Badge>
          )}
          
          {/* Botão de play centralizado */}
          <Flex 
            position="absolute" 
            top="0" 
            left="0" 
            width="100%" 
            height="100%" 
            alignItems="center" 
            justifyContent="center"
          >
            {isLoading ? (
              <Spinner color="white" size="xl" />
            ) : (
              <IconButton
                aria-label="Assistir"
                icon={<FiPlay size={24} />}
                size="lg"
                isRound
                colorScheme="red"
                opacity="0"
                _groupHover={{ opacity: 1 }}
                transition="opacity 0.3s"
              />
            )}
          </Flex>
        </Box>
        
        {/* Botão de favorito */}
        {user && (
          <IconButton
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            icon={<FiHeart color={isFavorite ? "red" : "white"} />}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(series.id);
            }}
            position="absolute"
            top="2"
            right="2"
            size="sm"
            bg="blackAlpha.700"
            _hover={{ bg: "blackAlpha.800" }}
            zIndex={2}
          />
        )}
      </Box>
      
      {/* Informações da série */}
      <Box p={2}>
        <Text 
          fontSize="sm" 
          fontWeight="medium" 
          color="white" 
          noOfLines={1}
        >
          {series.title || series.name}
        </Text>
        
        {series.group_title && (
          <Text 
            fontSize="xs" 
            color="gray.400" 
            noOfLines={1}
          >
            {series.group_title}
          </Text>
        )}
      </Box>
    </Box>
  );
}
