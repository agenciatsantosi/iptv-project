import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useIPTVStore } from '../store/iptvStore';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuthContext } from '../contexts/AuthContext';

export function IPTVPlayerPage() {
  const { isAuthenticated } = useAuthContext();
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { movies, series, live } = useIPTVStore();
  const { addToHistory } = useWatchHistory();
  const [isLoading, setIsLoading] = React.useState(true);
  
  const channel = React.useMemo(() => {
    const allChannels = [...movies, ...series, ...live];
    return allChannels.find(c => c.id === channelId);
  }, [movies, series, live, channelId]);

  React.useEffect(() => {
    if (channel && isAuthenticated) {
      addToHistory(channel);
    }
  }, [channel, addToHistory, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-center max-w-md mx-auto p-8">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Conteúdo Exclusivo</h2>
          <p className="text-gray-400 mb-6">
            Faça login para assistir a todo o nosso conteúdo
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-purple-500 hover:text-purple-400"
          >
            Voltar para página inicial
          </button>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Canal não encontrado</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-purple-500 hover:text-purple-400"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        <VideoPlayer
          url={channel.url}
          title={channel.name}
          isLive={true}
          onReady={() => setIsLoading(false)}
        />
        
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-gray-300 transition"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Voltar
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4">
          {channel.logo && (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-16 h-16 object-contain bg-zinc-900 rounded p-2"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{channel.name}</h1>
            <p className="text-gray-400">{channel.group}</p>
          </div>
        </div>
      </div>
    </div>
  );
}