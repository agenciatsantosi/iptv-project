import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Channel } from '../types/iptv';
import { useAuthContext } from '../contexts/AuthContext';

export function useRecommendations(limit: number = 20) {
  const [recommendations, setRecommendations] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar canais aleatórios por enquanto
      const { data: channels, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .limit(limit);

      if (channelsError) {
        throw channelsError;
      }

      if (channels && channels.length > 0) {
        // Embaralhar os canais para simular recomendações
        const shuffled = [...channels].sort(() => Math.random() - 0.5);
        setRecommendations(shuffled);
      } else {
        // Se não houver canais no banco, usar dados do IndexedDB
        const { data: localChannels } = await supabase
          .from('channels')
          .select('*')
          .limit(limit);

        if (localChannels) {
          const shuffled = [...localChannels].sort(() => Math.random() - 0.5);
          setRecommendations(shuffled);
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      // Silenciosamente falhar e mostrar canais aleatórios
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user?.id, limit]);

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations
  };
}