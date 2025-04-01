import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Image,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiSettings, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  return (
    <Box
      as="header"
      position="fixed"
      top="0"
      left={{ base: 0, md: '240px' }}
      right="0"
      zIndex="1000"
      bg={isScrolled ? 'rgba(20, 20, 20, 0.95)' : 'transparent'}
      backdropFilter={isScrolled ? 'blur(10px)' : 'none'}
      transition="all 0.3s ease"
      className={isScrolled ? 'header scrolled' : 'header'}
    >
      <Flex
        align="center"
        justify="space-between"
        px={{ base: 4, md: 6 }}
        py={4}
      >
        <Flex align="center" flex="1">
          <Box display={{ base: 'block', md: 'none' }} mr={4}>
            <Image src="/logo.png" alt="Logo" h="30px" />
          </Box>
          
          <Box
            position="relative"
            maxW="400px"
            flex="1"
            display={{ base: 'none', md: 'block' }}
          >
            <Input
              placeholder="Buscar..."
              bg="brand.background.tertiary"
              border="none"
              _placeholder={{ color: 'brand.text.tertiary' }}
              _hover={{ bg: 'brand.background.tertiary' }}
              _focus={{ bg: 'brand.background.tertiary', boxShadow: 'none' }}
              pl="40px"
            />
            <IconButton
              icon={<FiSearch />}
              variant="ghost"
              position="absolute"
              left="2"
              top="50%"
              transform="translateY(-50%)"
              aria-label="Search"
              color="brand.text.tertiary"
              _hover={{ color: 'brand.text.primary' }}
            />
          </Box>
        </Flex>

        <Flex align="center" gap={4}>
          <IconButton
            icon={<FiSearch />}
            variant="ghost"
            aria-label="Search"
            display={{ base: 'flex', md: 'none' }}
          />
          
          <IconButton
            icon={<FiBell />}
            variant="ghost"
            aria-label="Notifications"
            position="relative"
          >
            <Box
              position="absolute"
              top="-1"
              right="-1"
              w="2"
              h="2"
              bg="brand.primary"
              borderRadius="full"
            />
          </IconButton>

          <Menu>
            <MenuButton>
              <Avatar size="sm" src="/avatar.jpg" cursor="pointer" />
            </MenuButton>
            <MenuList bg="brand.background.secondary">
              <MenuItem
                icon={<FiSettings />}
                onClick={() => navigate('/settings')}
              >
                Configurações
              </MenuItem>
              <MenuItem icon={<FiLogOut />}>Sair</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
