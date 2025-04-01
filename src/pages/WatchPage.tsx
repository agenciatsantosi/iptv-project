import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

import { useIPTVStore } from '../store/iptvStore';
import { useAuthContext } from '../contexts/AuthContext';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';
import { useToast } from '../components/ui/Toast/useToast';
import { loadChannelDetails } from '../services/channel-sync';
import { Channel } from '../types/iptv';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

export function WatchPage() {
  const { id, episodeId } = useParams<{ id: string; episodeId?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { movies, series, live } = useIPTVStore();
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null);
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
  const checkProxy = async () => {
    try {
      console.log('Verificando proxy...');
      await axios.get(`${PROXY_URL}/health`);
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
        setError('Erro ao carregar detalhes do canal');
        return null;
      }

      console.log('Detalhes do item:', channel);
      setChannelDetails(channel);
      return channel;
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
      setError('Erro ao carregar detalhes');
      return null;
    }
  };

  // Prepara o vídeo para reprodução
  const prepareVideo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Verifica se o proxy está rodando
      console.log('Verificando proxy...');
      const proxyRunning = await checkProxy();
      console.log('Proxy está rodando');

      if (!proxyRunning) {
        toast({
          variant: "destructive",
          title: "Erro no servidor",
          description: "O servidor de streaming não está respondendo. Tente novamente."
        });
        setError('Servidor de streaming não disponível');
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
        const episode = channel.episodes?.find(ep => ep.id === episodeId);
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

        setVideoUrl(episode.url);
      } else {
        // Tenta diferentes propriedades para a URL
        const streamUrl = channel.url || channel.stream_url;
        console.log('Tentando obter URL:', {
          url: channel.url,
          stream_url: channel.stream_url,
          final_url: streamUrl
        });

        if (!streamUrl) {
          throw new Error('URL do vídeo não encontrada');
        }

        console.log('Preparando vídeo:', {
          id: channel.id,
          name: channel.name || channel.title,
          url: streamUrl
        });

        setVideoUrl(streamUrl);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao preparar vídeo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao preparar vídeo');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: `/watch/${id}${episodeId ? `/${episodeId}` : ''}` }
      });
      return;
    }

    if (!displayItem && !isDirectMode) {
      setError('Conteúdo não encontrado');
      setIsLoading(false);
      return;
    }

    if (isDirectMode) {
      setVideoUrl(directUrl);
      setIsLoading(false);
    } else {
      prepareVideo();
    }
  }, [isAuthenticated, displayItem, id, episodeId, navigate, isDirectMode, directUrl]);

  if (!isAuthenticated) {
    return null;
  }

  if (!displayItem && !isDirectMode || error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-4">
            {error || 'Conteúdo não encontrado'}
          </h2>
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
          <VideoPlayer
            id={id || ''}
            url={videoUrl}
            title={displayItem?.name || displayItem?.title || title || ''}
            type={displayItem?.type}
            episodeId={episodeId}
            seasonNumber={displayItem?.type === 'series' ? displayItem?.episodes?.find((ep: any) => ep.id === episodeId)?.season : undefined}
            autoPlay={true}
            onError={(error) => {
              console.error('Erro no player:', error);
              setError('Erro ao reproduzir vídeo');
            }}
          />
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white">
            {displayItem?.name || displayItem?.title || title}
          </h1>
          {displayItem?.type === 'series' && episodeId && (
            <p className="text-white/70 mt-1">
              {displayItem?.episodes?.find(ep => ep.id === episodeId)?.title || 'Episódio não encontrado'}
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
