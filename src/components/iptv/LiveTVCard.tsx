import React, { useState } from 'react';
import { Play, Info, Heart, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Channel } from '../../types/iptv';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIPTVStore } from '../../store/iptvStore';
import { useToast } from '@chakra-ui/react';

interface LiveTVCardProps {
  channel: Channel;
  showFavorite?: boolean;
}

export function LiveTVCard({ channel, showFavorite = true }: LiveTVCardProps) {
  const { isAuthenticated } = useAuthContext();
  const { favorites, toggleFavorite } = useIPTVStore();
  const [isHovered, setIsHovered] = useState(false);
  const toast = useToast();

  const isFavorite = favorites?.includes(channel.id);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para adicionar aos favoritos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await toggleFavorite(channel.id);
      toast({
        title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <div 
      className="group relative aspect-video rounded-md overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo/Thumbnail */}
      <img
        src={channel.logo || channel.thumbnailPath || channel['tvg-logo']}
        alt={channel.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Sem+Imagem';
        }}
      />

      {/* Overlay Gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Content */}
      <div 
        className={`absolute inset-x-0 bottom-0 p-4 space-y-4 transition-transform duration-300 ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <h3 className="text-lg font-semibold line-clamp-2 text-white">
          {channel.name}
        </h3>

        <div className="flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to={`/tv/watch/${channel.id}`}
                className="flex items-center justify-center gap-2 py-2 bg-red-600 rounded-md hover:bg-red-700 transition"
              >
                <Play className="w-4 h-4" />
                <span>Assistir Ao Vivo</span>
              </Link>

              {showFavorite && (
                <button
                  onClick={handleFavorite}
                  className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-md hover:bg-white/30 transition"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
                </button>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 py-2 bg-purple-600 rounded-md hover:bg-purple-700 transition"
            >
              <Play className="w-4 h-4" />
              <span>Fazer Login para Assistir</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
