import React from 'react';
import {
  Box,
  Grid,
  VStack,
  Text,
  Image,
  Button,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useProfileStore } from '../../store/profileStore';
import { Profile } from '../../types/profile';

const MotionBox = motion(Box);

export function ProfileSelector() {
  const { profiles, activeProfile, setActiveProfile, addProfile } = useProfileStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile);
  };

  const handleAddProfile = () => {
    onOpen();
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <VStack spacing={8} p={8}>
        <Text fontSize="3xl" fontWeight="bold">
          Quem está assistindo?
        </Text>

        <Grid
          templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)']}
          gap={6}
        >
          {profiles.map((profile) => (
            <MotionBox
              key={profile.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              cursor="pointer"
              onClick={() => handleProfileSelect(profile)}
            >
              <VStack spacing={3}>
                <Box
                  w="150px"
                  h="150px"
                  borderRadius="lg"
                  overflow="hidden"
                  borderWidth="4px"
                  borderColor={activeProfile?.id === profile.id ? 'brand.primary' : borderColor}
                >
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </Box>
                <Text fontSize="lg" fontWeight="medium">
                  {profile.name}
                </Text>
                {profile.isKidsProfile && (
                  <Text fontSize="sm" color="brand.primary">
                    Infantil
                  </Text>
                )}
              </VStack>
            </MotionBox>
          ))}

          {profiles.length < 5 && (
            <MotionBox
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              cursor="pointer"
              onClick={handleAddProfile}
            >
              <VStack spacing={3}>
                <Box
                  w="150px"
                  h="150px"
                  borderRadius="lg"
                  bg={bgColor}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth="4px"
                  borderColor={borderColor}
                >
                  <Text fontSize="6xl" color="gray.400">
                    +
                  </Text>
                </Box>
                <Text fontSize="lg" fontWeight="medium">
                  Adicionar Perfil
                </Text>
              </VStack>
            </MotionBox>
          )}
        </Grid>

        <Button
          colorScheme="brand"
          variant="outline"
          size="lg"
          onClick={() => {
            // Implementar gerenciamento de perfis
          }}
        >
          Gerenciar Perfis
        </Button>
      </VStack>

      {/* Modal para adicionar novo perfil */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Novo Perfil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Implementar formulário de criação de perfil */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
