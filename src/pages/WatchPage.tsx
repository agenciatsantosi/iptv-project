import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

import { useIPTVStore } from '../store/iptvStore';
import { useAuthContext } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import VODPlayer from '../components/VODPlayer';
import { useToast } from '../components/ui/Toast/useToast';
import { loadChannelDetails } from '../services/channel-sync';
import { Channel } from '../types/iptv';

// URLs dos proxies para diferentes tipos de conteúdo
const LIVE_PROXY_URL = import.meta.env.VITE_LIVE_PROXY_URL || 'http://localhost:3001';
const VOD_PROXY_URL = import.meta.env.VITE_VOD_PROXY_URL || 'http://localhost:3002';

export function WatchPage() {
  const { id, episodeId } = useParams<{ id: string; episodeId?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { movies, series, live } = useIPTVStore();
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Obter parâmetros da URL para reprodução direta
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  const directUrl = searchParams.get('url');
  const title = searchParams.get('title');

  // Verificar se é modo de reprodução direta
  const isDirectMode = id === 'direct' && directUrl;

  // Encontra o item (filme, série ou canal)
  const item = useMemo(() => {
    if (!id) return null;
    
    // Se estiver no modo direto, não precisamos buscar o item
    if (isDirectMode) return null;

    console.log('Buscando conteúdo:', { id, episodeId });

    // Conta o total de conteúdo disponível
    const totalContent = {
      movies: movies.length,
      series: series.length,
      live: live.length,
      total: movies.length + series.length + live.length
    };
    console.log('Total de conteúdo:', totalContent);

    // Busca em filmes
    const movie = movies.find(movie => movie.id === id);
    if (movie) return movie;

    // Busca em canais ao vivo
    const liveChannel = live.find(channel => channel.id === id);
    if (liveChannel) return liveChannel;

    // Busca em séries
    const serie = series.find((serie: any) => serie.id === id);
    if (serie) {
      // Se não tiver episodeId, retorna a série
      if (!episodeId) return serie;
      
      // Verifica se a série tem o episódio
      const hasEpisode = serie.episodes?.some((ep: any) => ep.id === episodeId);
      if (hasEpisode) return serie;
    }

    // Busca direta por episódio em todas as séries
    for (const serie of series) {
      const episode = serie.episodes?.find((ep: any) => ep.id === id);
      if (episode) return episode;
    }

    console.log('Conteúdo encontrado:', null);
    return null;
  }, [id, episodeId, movies, series, live, isDirectMode]);

  // Cria um item virtual para o modo direto
  const directItem = useMemo(() => {
    if (!isDirectMode) return null;
    
    return {
      id: 'direct',
      title: title || 'Reprodução Direta',
      name: title || 'Reprodução Direta',
      url: directUrl,
      type: 'movie' as const,
      group_title: 'Direto'
    };
  }, [isDirectMode, directUrl, title]);

  // Item a ser exibido (real ou virtual)
  const displayItem = useMemo(() => {
    return item || directItem;
  }, [item, directItem]);

  // Verifica se o proxy está rodando
  const checkProxy = async (proxyUrl: string) => {
    try {
      console.log(`Verificando proxy em ${proxyUrl}...`);
      await axios.get(`${proxyUrl}/health`);
      console.log('Proxy está rodando');
      return true;
    } catch (error) {
      console.error('Erro ao verificar proxy:', error);
      return false;
    }
  };

  // Carrega detalhes do canal/filme
  const loadDetails = async () => {
    if (!id) return null;

    try {
      const { channel, error } = await loadChannelDetails(id);
      
      if (error || !channel) {
        console.error('Erro ao carregar detalhes:', error);
        return null;
      }
      
      return channel;
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      return null;
    }
  };

  // Obtém o stream do proxy
  const prepareVideo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Preparando vídeo...');
      
      // Determina qual proxy usar com base no tipo de conteúdo
      const isLiveContent = displayItem?.type === 'live';
      const proxyUrl = isLiveContent ? LIVE_PROXY_URL : VOD_PROXY_URL;
      
      console.log(`Usando proxy ${isLiveContent ? 'LIVE' : 'VOD'}: ${proxyUrl}`);
      
      // Verifica se o proxy está rodando
      const proxyRunning = await checkProxy(proxyUrl);

      if (!proxyRunning) {
        toast({
          variant: "destructive",
          title: "Erro no servidor",
          description: `O servidor de streaming ${isLiveContent ? 'ao vivo' : 'de filmes e séries'} não está respondendo.`
        });
        setError(`Servidor de streaming ${isLiveContent ? 'ao vivo' : 'de filmes e séries'} não disponível`);
        setIsLoading(false);
        return;
      }

      // Carrega detalhes atualizados do canal
      const details = await loadDetails();
      const channel = details || displayItem;

      if (!channel) {
        throw new Error('Canal não encontrado');
      }

      if (channel.type === 'series') {
        if (!episodeId) {
          navigate(`/series/${id}`);
          return;
        }

        // Busca o episódio específico
        const episode = channel.episodes?.find((ep: any) => ep.id === episodeId);
        if (!episode) {
          throw new Error('Episódio não encontrado');
        }

        console.log('Preparando episódio:', {
          seriesId: id,
          episodeId,
          url: episode.url
        });

        if (!episode.url) {
          throw new Error('URL do episódio não encontrada');
        }

        // Usar proxy para streaming de episódios (VOD)
        const streamUrl = `${VOD_PROXY_URL}/stream?url=${encodeURIComponent(episode.url)}`;
        console.log('URL do proxy (VOD):', streamUrl);
        setVideoUrl(streamUrl);
      } else {
        // Tenta diferentes propriedades para a URL
        const streamUrl = channel.url || channel.stream_url;
        console.log('Tentando obter URL:', {
          channelUrl: channel.url,
          streamUrl: channel.stream_url,
          finalUrl: streamUrl
        });

        if (!streamUrl) {
          console.warn('URL do canal não encontrada, usando URL de teste');
          // Usar proxy adequado para o tipo de conteúdo
          const testUrl = isLiveContent 
            ? `${LIVE_PROXY_URL}/stream?url=${encodeURIComponent('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')}`
            : `${VOD_PROXY_URL}/stream?url=${encodeURIComponent('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')}`;
          setVideoUrl(testUrl);
        } else {
          // Usar proxy apropriado com base no tipo de conteúdo
          const streamProxyUrl = isLiveContent 
            ? `${LIVE_PROXY_URL}/stream?url=${encodeURIComponent(streamUrl)}`
            : `${VOD_PROXY_URL}/stream?url=${encodeURIComponent(streamUrl)}`;
          console.log(`URL do proxy (${isLiveContent ? 'LIVE' : 'VOD'}):`, streamProxyUrl);
          setVideoUrl(streamProxyUrl);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao preparar vídeo:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setIsLoading(false);
    }
  };

  // Efeito para preparar o vídeo quando o item mudar
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    prepareVideo();
  }, [displayItem, isAuthenticated, navigate]);

  // Renderiza mensagem de erro
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Erro ao carregar vídeo</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              prepareVideo();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition mb-4"
          >
            Tentar novamente
          </button>
          <br />
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o início</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            to={displayItem?.type === 'series' ? `/series/${id}` : '/'}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
        </div>

        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {displayItem?.type === 'live' ? (
            <VideoPlayer
              url={videoUrl}
              title={displayItem?.name || displayItem?.title || title || ''}
              poster={(displayItem as any)?.logo || (displayItem as any)?.poster}
              autoPlay={true}
              controls={true}
              muted={false}
              onError={(error: Error) => {
                console.error('Erro no player de TV:', error);
                setError('Erro ao reproduzir TV ao vivo');
              }}
            />
          ) : (
            <VODPlayer
              url={videoUrl}
              title={displayItem?.name || displayItem?.title || title || ''}
              poster={(displayItem as any)?.logo || (displayItem as any)?.poster}
              onError={(error: Error) => {
                console.error('Erro no player VOD:', error);
                setError('Erro ao reproduzir vídeo');
              }}
            />
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white">
            {displayItem?.name || displayItem?.title || title}
          </h1>
          {displayItem?.type === 'series' && episodeId && (
            <p className="text-white/70 mt-1">
              {displayItem?.episodes?.find((ep: any) => ep.id === episodeId)?.title || 'Episódio não encontrado'}
            </p>
          )}
          {displayItem?.group_title && (
            <p className="text-white/60 mt-1">
              {displayItem?.group_title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
