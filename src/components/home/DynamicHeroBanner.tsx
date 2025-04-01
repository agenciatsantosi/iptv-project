import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hls from 'hls.js';

const MotionBox = motion(Box);

interface HeroBannerProps {
  content: {
    id: string;
    title: string;
    description: string;
    previewUrl: string;
    logo: string;
    thumbnailUrl: string;
    genres: string[];
  };
}

export function DynamicHeroBanner({ content }: HeroBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  const overlayBg = useColorModeValue(
    'linear(to-t, blackAlpha.900, transparent)',
    'linear(to-t, gray.900, transparent)'
  );

  useEffect(() => {
    if (videoElement && content.previewUrl) {
      const hls = new Hls();
      hls.loadSource(content.previewUrl);
      hls.attachMedia(videoElement);
      
      // Autoplay com delay
      setTimeout(() => {
        videoElement.play();
        setIsPlaying(true);
      }, 2000);

      return () => {
        hls.destroy();
      };
    }
  }, [videoElement, content.previewUrl]);

  const handlePlay = () => {
    navigate(`/watch/${content.id}`);
  };

  const handleMoreInfo = () => {
    navigate(`/details/${content.id}`);
  };

  const toggleMute = () => {
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Box position="relative" height="85vh" width="100%">
      <AnimatePresence>
        {!isPlaying && (
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgImage={`url(${content.logo || '/placeholder-banner.jpg'})`}
            bgPosition="center"
            bgSize="cover"
            filter="auto"
            brightness="60%"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <video
        ref={(el) => setVideoElement(el)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        muted={isMuted}
        loop
      />

      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={overlayBg}
      />

      <Flex
        position="absolute"
        bottom="10%"
        left="5%"
        right="5%"
        direction="column"
        gap={4}
      >
        <Text
          fontSize={['4xl', '5xl', '6xl']}
          fontWeight="bold"
          color="white"
          textShadow="2px 2px 4px rgba(0,0,0,0.5)"
        >
          {content.title}
        </Text>

        <Text
          fontSize={['md', 'lg']}
          color="white"
          maxW="600px"
          textShadow="1px 1px 2px rgba(0,0,0,0.5)"
        >
          {content.description}
        </Text>

        <HStack spacing={4} mt={4}>
          <Button
            leftIcon={<Play />}
            size="lg"
            colorScheme="brand"
            onClick={handlePlay}
          >
            Assistir
          </Button>
          
          <Button
            leftIcon={<Info />}
            size="lg"
            variant="outline"
            colorScheme="whiteAlpha"
            onClick={handleMoreInfo}
          >
            Mais Informações
          </Button>

          <IconButton
            aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            icon={isMuted ? <VolumeX /> : <Volume2 />}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={toggleMute}
          />
        </HStack>

        <HStack spacing={2} mt={2}>
          {content.genres.map((genre) => (
            <Text
              key={genre}
              color="whiteAlpha.800"
              fontSize="sm"
              textShadow="1px 1px 2px rgba(0,0,0,0.5)"
            >
              {genre}
            </Text>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
}
