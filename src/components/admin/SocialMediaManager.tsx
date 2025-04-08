import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Text
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { 
  SocialMedia, 
  SOCIAL_MEDIA_ICONS, 
  fetchSocialMedia, 
  addSocialMedia, 
  updateSocialMedia, 
  deleteSocialMedia 
} from '../../utils/socialMediaUtils';

export function SocialMediaManager() {
  const [socialMediaList, setSocialMediaList] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSocialMedia, setCurrentSocialMedia] = useState<SocialMedia>({
    name: '',
    url: '',
    icon: 'telegram',
    active: true,
    order: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Carregar lista de redes sociais
  const loadSocialMediaList = async () => {
    setLoading(true);
    try {
      const data = await fetchSocialMedia();
      setSocialMediaList(data);
    } catch (error) {
      console.error('Erro ao carregar redes sociais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de redes sociais.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadSocialMediaList();
  }, []);

  // Abrir modal para adicionar nova rede social
  const handleAddNew = () => {
    setCurrentSocialMedia({
      name: '',
      url: '',
      icon: 'telegram',
      active: true,
      order: socialMediaList.length + 1
    });
    setIsEditing(false);
    onOpen();
  };

  // Abrir modal para editar rede social existente
  const handleEdit = (socialMedia: SocialMedia) => {
    setCurrentSocialMedia(socialMedia);
    setIsEditing(true);
    onOpen();
  };

  // Atualizar campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentSocialMedia(prev => ({ ...prev, [name]: value }));
  };

  // Atualizar campo de status ativo/inativo
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSocialMedia(prev => ({ ...prev, active: e.target.checked }));
  };

  // Salvar nova rede social ou atualizar existente
  const handleSave = async () => {
    try {
      if (!currentSocialMedia.name || !currentSocialMedia.url) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Nome e URL são campos obrigatórios.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setLoading(true);
      
      if (isEditing && currentSocialMedia.id) {
        // Atualizar rede social existente
        const updated = await updateSocialMedia(currentSocialMedia.id, currentSocialMedia);
        if (updated) {
          toast({
            title: 'Sucesso',
            description: 'Rede social atualizada com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Adicionar nova rede social
        const added = await addSocialMedia(currentSocialMedia);
        if (added) {
          toast({
            title: 'Sucesso',
            description: 'Rede social adicionada com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      }
      
      // Recarregar lista e fechar modal
      await loadSocialMediaList();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar rede social:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a rede social.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Excluir rede social
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta rede social?')) {
      setLoading(true);
      try {
        const success = await deleteSocialMedia(id);
        if (success) {
          toast({
            title: 'Sucesso',
            description: 'Rede social excluída com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          await loadSocialMediaList();
        }
      } catch (error) {
        console.error('Erro ao excluir rede social:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a rede social.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Gerenciar Redes Sociais</Text>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={handleAddNew}
          isLoading={loading}
        >
          Adicionar Nova
        </Button>
      </HStack>

      {/* Tabela de redes sociais */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>URL</Th>
              <Th>Ícone</Th>
              <Th>Status</Th>
              <Th>Ordem</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {socialMediaList.map(socialMedia => (
              <Tr key={socialMedia.id}>
                <Td>{socialMedia.name}</Td>
                <Td>
                  <a href={socialMedia.url} target="_blank" rel="noopener noreferrer">
                    {socialMedia.url.length > 30 
                      ? `${socialMedia.url.substring(0, 30)}...` 
                      : socialMedia.url}
                  </a>
                </Td>
                <Td>{socialMedia.icon}</Td>
                <Td>{socialMedia.active ? 'Ativo' : 'Inativo'}</Td>
                <Td>{socialMedia.order}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar"
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleEdit(socialMedia)}
                    />
                    <IconButton
                      aria-label="Excluir"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => socialMedia.id && handleDelete(socialMedia.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
            {socialMediaList.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  Nenhuma rede social cadastrada.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal para adicionar/editar rede social */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Editar Rede Social' : 'Adicionar Rede Social'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome</FormLabel>
                <Input
                  name="name"
                  value={currentSocialMedia.name}
                  onChange={handleChange}
                  placeholder="Ex: Telegram, WhatsApp, etc."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>URL</FormLabel>
                <Input
                  name="url"
                  value={currentSocialMedia.url}
                  onChange={handleChange}
                  placeholder="Ex: https://t.me/seu_grupo"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Ícone</FormLabel>
                <Select
                  name="icon"
                  value={currentSocialMedia.icon}
                  onChange={handleChange}
                >
                  {Object.entries(SOCIAL_MEDIA_ICONS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Ordem</FormLabel>
                <Input
                  name="order"
                  type="number"
                  value={currentSocialMedia.order}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="active" mb="0">
                  Ativo
                </FormLabel>
                <Switch
                  id="active"
                  name="active"
                  isChecked={currentSocialMedia.active}
                  onChange={handleSwitchChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSave}
              isLoading={loading}
            >
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
