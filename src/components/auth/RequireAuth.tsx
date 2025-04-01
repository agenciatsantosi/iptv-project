import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, loading } = useAuthContext();
  const navigate = useNavigate();

  // Se estiver carregando, mostra loading
  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </Box>
    );
  }

  // Se não estiver autenticado, mostra mensagem de login
  if (!isAuthenticated) {
    return (
      <Box minH="calc(100vh - 64px)" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text fontSize="xl" color="white">
            Faça login para acessar este conteúdo
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/login')}
          >
            Fazer Login
          </Button>
        </VStack>
      </Box>
    );
  }

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
}
