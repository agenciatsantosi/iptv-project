import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, Link, Icon, HStack, Spinner } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { fetchActiveSocialMedia, SocialMedia } from '../../utils/socialMediaUtils';
import { FaTelegram, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaDiscord, FaReddit, FaPinterest, FaLinkedin, FaSnapchat, FaTwitch } from 'react-icons/fa';

// Mapeamento de ícones para componentes do React Icons
const ICON_MAP: Record<string, any> = {
  telegram: FaTelegram,
  whatsapp: FaWhatsapp,
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  discord: FaDiscord,
  reddit: FaReddit,
  pinterest: FaPinterest,
  linkedin: FaLinkedin,
  snapchat: FaSnapchat,
  twitch: FaTwitch,
};

interface SocialMediaBannerProps {
  title?: string;
}

export function SocialMediaBanner({ title = "Nossas Redes Sociais" }: SocialMediaBannerProps) {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSocialMedia = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveSocialMedia();
        setSocialMedia(data);
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar redes sociais:', error);
        setError('Erro ao carregar redes sociais');
      } finally {
        setLoading(false);
      }
    };

    loadSocialMedia();
  }, []);

  // Se houver erro ou não houver redes sociais ativas, mostrar banner do Telegram como fallback
  if ((error || (!loading && socialMedia.length === 0))) {
    return (
      <Box 
        bg="linear-gradient(90deg, #0088cc 0%, #005f8c 100%)"
        borderRadius="md"
        p={4}
        mb={6}
        mt={2}
      >
        <Flex align="center" justify="space-between">
          <Flex align="center">
            <Icon as={FaTelegram} boxSize={6} color="white" mr={3} />
            <Text color="white" fontWeight="bold">
              Entre no nosso grupo do Telegram
            </Text>
          </Flex>
          <Link 
            href="https://t.me/seu_grupo" 
            isExternal
            bg="whiteAlpha.300"
            color="white"
            px={3}
            py={2}
            borderRadius="md"
            _hover={{ bg: "whiteAlpha.400" }}
            display="flex"
            alignItems="center"
          >
            Entrar <ExternalLinkIcon mx={1} />
          </Link>
        </Flex>
      </Box>
    );
  }

  // Mostrar spinner durante o carregamento
  if (loading) {
    return (
      <Box 
        bg="linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)"
        borderRadius="md"
        p={4}
        mb={6}
        mt={2}
      >
        <Flex justify="center" align="center" py={2}>
          <Spinner size="sm" mr={2} />
          <Text>Carregando redes sociais...</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box 
      bg="linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)"
      borderRadius="md"
      p={4}
      mb={6}
      mt={2}
    >
      <Text color="white" fontWeight="bold" mb={3}>
        {title}
      </Text>
      <HStack spacing={3} overflowX="auto" pb={2} css={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        'scrollbarWidth': 'none'
      }}>
        {socialMedia.map((item) => {
          const SocialIcon = ICON_MAP[item.icon] || FaTelegram;
          
          // Determinar a cor de fundo baseada no tipo de rede social
          let bgColor = "#0088cc"; // Padrão (Telegram)
          if (item.icon === "whatsapp") bgColor = "#25D366";
          if (item.icon === "facebook") bgColor = "#1877F2";
          if (item.icon === "instagram") bgColor = "#E1306C";
          if (item.icon === "twitter") bgColor = "#1DA1F2";
          if (item.icon === "youtube") bgColor = "#FF0000";
          if (item.icon === "tiktok") bgColor = "#000000";
          if (item.icon === "discord") bgColor = "#5865F2";
          
          return (
            <Link 
              key={item.id}
              href={item.url} 
              isExternal
              bg={bgColor}
              color="white"
              px={4}
              py={2}
              borderRadius="md"
              _hover={{ opacity: 0.9 }}
              display="flex"
              alignItems="center"
              minW="120px"
              justifyContent="center"
            >
              <Icon as={SocialIcon} mr={2} />
              {item.name}
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
}
