import React from 'react';
import { Box, Button, Flex, Text, Link } from '@chakra-ui/react';

interface TelegramBannerProps {
  groupLink: string;
  groupName: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
}

export function TelegramBanner({
  groupLink,
  groupName,
  description = 'Junte-se ao nosso grupo no Telegram para novidades e suporte!',
  backgroundColor = '#1E88E5',
  textColor = 'white',
  buttonColor = '#0D47A1'
}: TelegramBannerProps) {
  return (
    <Box 
      width="100%" 
      backgroundColor={backgroundColor}
      color={textColor}
      py={3}
      px={4}
      borderRadius="md"
      mb={4}
      boxShadow="md"
    >
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'center', md: 'center' }}
        gap={3}
      >
        <Box>
          <Flex align="center" mb={1}>
            {/* Ícone do Telegram */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="white" 
              style={{ marginRight: '8px' }}
            >
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-2.426 14.741h-.021l-3.07-2.855.724-.767 2.226 1.864 6.19-5.035.771.72-6.82 6.073z"/>
            </svg>
            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
              {groupName}
            </Text>
          </Flex>
          <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.9}>
            {description}
          </Text>
        </Box>
        <Link href={groupLink} isExternal _hover={{ textDecoration: 'none' }}>
          <Button 
            backgroundColor={buttonColor}
            color={textColor}
            _hover={{ opacity: 0.9 }}
            size={{ base: 'sm', md: 'md' }}
            width={{ base: '100%', md: 'auto' }}
          >
            Entrar no Grupo
          </Button>
        </Link>
      </Flex>
    </Box>
  );
}
