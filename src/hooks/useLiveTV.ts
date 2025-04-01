import { useState, useCallback, useEffect } from 'react';
import { useIPTVStore } from '@/store/iptvStore';

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

      // Encontra o canal na lista
      const channel = live.find(ch => ch.id === channelId);
      if (!channel) {
        throw new Error('Canal não encontrado');
      }

      console.log('Canal encontrado:', channel);
      setChannelInfo(channel);

      // Configura a URL do stream usando o proxy
      const proxyStreamUrl = `http://localhost:3002/stream?url=${encodeURIComponent(channel.url)}`;
      console.log('URL do stream:', proxyStreamUrl);
      setStreamUrl(proxyStreamUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao inicializar stream');
      console.error('Erro ao inicializar stream:', err);
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
