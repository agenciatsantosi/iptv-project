import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Badge,
  IconButton,
  useBreakpointValue,
  VStack,
  HStack,
  Image,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaVolumeMute, FaVolumeUp, FaStop } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FeaturedContent } from '../../types/content';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface EnhancedHeroBannerProps {
  content: FeaturedContent;
}

export function EnhancedHeroBanner({ content }: EnhancedHeroBannerProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, md: false });
  const bannerHeight = useBreakpointValue({ base: '50vh', md: '70vh' });

  useEffect(() => {
    if (!content) return;

    const loadVideo = async () => {
      if (videoRef.current && content.previewUrl) {
        try {
          videoRef.current.src = content.previewUrl;
          videoRef.current.load();
          setHasError(false);
        } catch (error) {
          console.error('Erro ao carregar vídeo:', error);
          setHasError(true);
          toast({
            title: 'Erro ao carregar preview',
            description: 'Não foi possível carregar o vídeo de preview',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    loadVideo();

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [content, toast]);

  const handleVideoLoaded = () => {
    setIsVideoReady(true);
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Erro ao reproduzir vídeo:', error);
          setHasError(true);
        });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlay = () => {
    if (content.id) {
      navigate(`/watch/${content.id}`);
    }
  };

  const handleInfo = () => {
    if (content.id) {
      navigate(`/content/${content.id}`);
    }
  };

  return (
    <Box position="relative" height={bannerHeight} width="100%" overflow="hidden">
      {/* Background Image/Video */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0}>
        {!isVideoReady && content.logo && (
          <Image
            src={content.logo}
            alt={content.title}
            objectFit="cover"
            width="100%"
            height="100%"
          />
        )}
        
        {content.previewUrl && !hasError && (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isVideoReady ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
            muted={isMuted}
            autoPlay
            loop
            playsInline
            onLoadedData={handleVideoLoaded}
            poster={content.logo}
          />
        )}

        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 100%)"
        />
      </Box>

      {/* Content */}
      <Container maxW="container.xl" height="100%" position="relative">
        <Flex
          direction="column"
          justify="center"
          height="100%"
          color="white"
          pl={{ base: 4, md: 8 }}
          pr={{ base: 4, md: 0 }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack align="flex-start" spacing={4} maxW={{ base: "100%", md: "50%" }}>
              {content.highlightText && (
                <Badge colorScheme="blue" fontSize="sm">
                  {content.highlightText}
                </Badge>
              )}

              <Heading
                as="h1"
                size={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                textShadow="2px 2px 4px rgba(0,0,0,0.4)"
              >
                {content.title}
              </Heading>

              {content.description && (
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  textShadow="1px 1px 2px rgba(0,0,0,0.4)"
                  noOfLines={3}
                >
                  {content.description}
                </Text>
              )}

              <HStack spacing={4}>
                <Button
                  leftIcon={<FaPlay />}
                  colorScheme="blue"
                  size={{ base: "sm", md: "md" }}
                  onClick={handlePlay}
                >
                  Assistir
                </Button>

                <Button
                  leftIcon={<FaInfoCircle />}
                  variant="outline"
                  colorScheme="whiteAlpha"
                  size={{ base: "sm", md: "md" }}
                  onClick={handleInfo}
                >
                  Mais Informações
                </Button>

                {isVideoReady && !hasError && (
                  <IconButton
                    aria-label={isMuted ? "Ativar som" : "Desativar som"}
                    icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    size={{ base: "sm", md: "md" }}
                    onClick={toggleMute}
                  />
                )}
              </HStack>
            </VStack>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
}
