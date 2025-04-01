import React, { useEffect, useState } from 'react';
import { Box, Container, useColorMode } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { colorMode } = useColorMode();
  const location = useLocation();
  const isWatchPage = location.pathname.includes('/watch');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      bg="brand.background.primary"
      minH="100vh"
      color="brand.text.primary"
      transition="all 0.3s ease"
    >
      {!isWatchPage && (
        <Header isScrolled={isScrolled} />
      )}
      <Box display="flex">
        {!isWatchPage && (
          <Sidebar />
        )}
        <Box
          flex="1"
          ml={!isWatchPage ? { base: 0, md: '240px' } : 0}
          transition="margin 0.3s ease"
        >
          <Container
            maxW={isWatchPage ? '100%' : 'container.xl'}
            px={isWatchPage ? 0 : { base: 4, md: 6 }}
            py={isWatchPage ? 0 : { base: 4, md: 6 }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
