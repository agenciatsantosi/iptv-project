import { useState, useCallback, useEffect } from 'react';
import { useIPTVStore } from '@/store/iptvStore';
import axios from 'axios';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3002';

interface UseLiveTVOptions {
  channelId?: string;
  autoPlay?: boolean;
}

interface UseLiveTVReturn {
  isLoading: boolean;
  error: string | null;
  streamUrl: string | null;
  channelInfo: any | null;
  retryStream: () => void;
}

export function useLiveTV({ channelId, autoPlay = true }: UseLiveTVOptions): UseLiveTVReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [channelInfo, setChannelInfo] = useState<any | null>(null);
  const { live } = useIPTVStore();

  const initializeStream = useCallback(async () => {
    if (!channelId) {
      setError('ID do canal não fornecido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`[useLiveTV] Iniciando stream para canal ID: ${channelId}`);
      console.log('[useLiveTV] Usando proxy:', PROXY_URL);
      
      // Encontra o canal na lista
      const channel = live.find(ch => ch.id === channelId);
      if (!channel) {
        throw new Error('Canal não encontrado');
      }

      console.log('[useLiveTV] Canal encontrado:', channel);
      setChannelInfo(channel);

      // Se o canal não tiver URL, tentar gerar uma URL alternativa
      if (!channel.url) {
        console.log('[useLiveTV] Canal não possui URL, tentando gerar URL alternativa...');
        
        try {
          // Chamar o endpoint para gerar URL alternativa
          const response = await axios.get(`${PROXY_URL}/generate-url`, {
            params: {
              id: channel.id,
              name: channel.name
            }
          });
          
          if (response.data && response.data.url) {
            console.log('[useLiveTV] URL alternativa gerada:', response.data.url);
            
            // Configurar URL do stream usando o proxy
            const proxyStreamUrl = `${PROXY_URL}/direct?url=${encodeURIComponent(response.data.url)}`;
            console.log('[useLiveTV] URL do stream com proxy:', proxyStreamUrl);
            setStreamUrl(proxyStreamUrl);
            return;
          } else {
            throw new Error('Não foi possível gerar URL alternativa');
          }
        } catch (genError) {
          console.error('[useLiveTV] Erro ao gerar URL alternativa:', genError);
          throw new Error('Falha ao gerar URL alternativa para o canal');
        }
      }

      // Se o canal tiver URL, usar normalmente
      const proxyStreamUrl = `${PROXY_URL}/direct?url=${encodeURIComponent(channel.url)}`;
      console.log('[useLiveTV] URL do stream com proxy:', proxyStreamUrl);
      setStreamUrl(proxyStreamUrl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar stream';
      console.error('[useLiveTV] Erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, live]);

  useEffect(() => {
    if (autoPlay) {
      initializeStream();
    }
  }, [autoPlay, initializeStream]);

  const retryStream = useCallback(() => {
    console.log('[useLiveTV] Tentando novamente...');
    initializeStream();
  }, [initializeStream]);

  return {
    isLoading,
    error,
    streamUrl,
    channelInfo,
    retryStream
  };
}
