import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, useToast } from '@chakra-ui/react';

export function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Pega a rota de retorno do state, se não houver usa '/'
  const from = (location.state as any)?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: 'Login realizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Redireciona para a página que o usuário tentou acessar
      navigate(from, { replace: true });
    }
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="gray.900"
    >
      <Box 
        w="full" 
        maxW="md" 
        p={8} 
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg="gray.800"
      >
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Login
            </Text>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <FormControl id="email">
              <FormLabel color="gray.300">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _hover={{ borderColor: 'gray.500' }}
                _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
              />
            </FormControl>

            <FormControl id="password">
              <FormLabel color="gray.300">Senha</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _hover={{ borderColor: 'gray.500' }}
                _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
            >
              Entrar
            </Button>

            <Text color="gray.400" fontSize="sm">
              Não tem uma conta?{' '}
              <Button
                variant="link"
                color="blue.400"
                onClick={() => navigate('/register')}
              >
                Registre-se
              </Button>
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
