import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlay, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface FeaturedContentProps {
  content: {
    id: string;
    name: string;
    group?: string;
    url?: string;
    posterPath?: string;
    thumbnailPath?: string;
    logo?: string;
  };
}

export function FeaturedContent({ content }: FeaturedContentProps) {
  const navigate = useNavigate();

  // Se não houver conteúdo, não renderiza nada
  if (!content) return null;

  const overlayGradient = useColorModeValue(
    'linear(to-t, brand.background.primary 0%, transparent 60%, brand.background.primary 100%)',
    'linear(to-t, gray.900 0%, transparent 60%, gray.900 100%)'
  );

  const handlePlay = () => {
    if (content.url) {
      navigate(`/watch/${content.id}`);
    }
  };

  const handleMoreInfo = () => {
    navigate(`/content/${content.id}`);
  };

  // Usar a primeira imagem disponível
  const backgroundImage = content.posterPath || content.thumbnailPath || content.logo;

  return (
    <Box position="relative" height="100%" width="100%">
      {/* Background Image */}
      {backgroundImage && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundImage={`url(${backgroundImage})`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
        />
      )}

      {/* Gradient Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={overlayGradient}
      />

      {/* Content */}
      <Container
        maxW="container.xl"
        height="100%"
        position="relative"
        zIndex={1}
        px={4}
      >
        <VStack
          height="100%"
          justify="flex-end"
          align="flex-start"
          spacing={4}
          pb={16}
        >
          <Heading
            as="h1"
            size="2xl"
            color="white"
            textShadow="0 2px 4px rgba(0,0,0,0.4)"
          >
            {content.name}
          </Heading>

          {content.group && (
            <Text color="gray.300" fontSize="xl">
              {content.group}
            </Text>
          )}

          <HStack spacing={4} pt={4}>
            {content.url && (
              <Button
                leftIcon={<FiPlay />}
                colorScheme="red"
                size="lg"
                onClick={handlePlay}
                _hover={{
                  transform: 'scale(1.05)',
                }}
                transition="all 0.2s"
              >
                Assistir
              </Button>
            )}
            <Button
              leftIcon={<FiInfo />}
              variant="outline"
              size="lg"
              color="white"
              _hover={{
                bg: 'whiteAlpha.200',
                transform: 'scale(1.05)',
              }}
              onClick={handleMoreInfo}
              transition="all 0.2s"
            >
              Mais Informações
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}