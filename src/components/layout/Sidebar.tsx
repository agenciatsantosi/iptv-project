import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Image,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiTv,
  FiFilm,
  FiMonitor,
  FiHeart,
  FiSettings,
  FiDatabase,
} from 'react-icons/fi';

interface NavItemProps {
  icon: any;
  children: string;
  to: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to, isActive }) => {
  const activeBg = useColorModeValue('brand.primary', 'brand.primary');
  const hoverBg = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');

  return (
    <Link to={to} style={{ width: '100%' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? 'white' : 'brand.text.secondary'}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
          color: 'white',
        }}
        transition="all 0.3s ease"
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
          transition="all 0.3s ease"
          _groupHover={{
            transform: 'scale(1.1)',
          }}
        />
        <Text fontSize="14" fontWeight={isActive ? 'bold' : 'medium'}>
          {children}
        </Text>
      </Flex>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box
      position="fixed"
      left="0"
      w="240px"
      h="100vh"
      bg="brand.background.secondary"
      borderRight="1px"
      borderColor="whiteAlpha.100"
      display={{ base: 'none', md: 'block' }}
      className="sidebar"
    >
      <VStack spacing={6} align="stretch" h="full">
        <Box p="5">
          <Image src="/logo.png" alt="Logo" h="40px" />
        </Box>

        <VStack spacing={2} align="stretch">
          <NavItem
            icon={FiHome}
            to="/"
            isActive={location.pathname === '/'}
          >
            Início
          </NavItem>
          <NavItem
            icon={FiTv}
            to="/live"
            isActive={location.pathname === '/live'}
          >
            TV ao Vivo
          </NavItem>
          <NavItem
            icon={FiFilm}
            to="/movies"
            isActive={location.pathname === '/movies'}
          >
            Filmes
          </NavItem>
          <NavItem
            icon={FiMonitor}
            to="/series"
            isActive={location.pathname === '/series'}
          >
            Séries
          </NavItem>
        </VStack>

        <Divider borderColor="whiteAlpha.200" />

        <VStack spacing={2} align="stretch">
          <NavItem
            icon={FiHeart}
            to="/favorites"
            isActive={location.pathname === '/favorites'}
          >
            Minha Lista
          </NavItem>
          <NavItem
            icon={FiSettings}
            to="/settings"
            isActive={location.pathname === '/settings'}
          >
            Configurações
          </NavItem>
        </VStack>

        <Box flex="1" />

        <Box p="5">
          <Text fontSize="xs" color="brand.text.tertiary">
            © 2025 IPTV Pro. Todos os direitos reservados.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;
