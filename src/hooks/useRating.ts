import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRating(contentId: string) {
  const [rating, setRatingState] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [contentId]);

  const fetchRatings = async () => {
    try {
      // Busca avaliação do usuário
      const { data: userRating } = await supabase
        .from('ratings')
        .select('score')
        .eq('content_id', contentId)
        .maybeSingle();

      if (userRating) {
        setRatingState(userRating.score);
      }

      // Busca média e total de avaliações
      const { data: stats } = await supabase
        .rpc('get_content_rating_stats', { content_id: contentId });

      if (stats) {
        setAverageRating(stats.average_rating);
        setTotalRatings(stats.total_ratings);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  const setRating = async (score: number) => {
    try {
      setLoading(true);

      if (score === 0) {
        // Remove avaliação
        await supabase
          .from('ratings')
          .delete()
          .eq('content_id', contentId);
        
        setRatingState(null);
      } else {
        // Adiciona ou atualiza avaliação
        await supabase
          .from('ratings')
          .upsert({
            content_id: contentId,
            score
          });

        setRatingState(score);
      }

      await fetchRatings();
    } catch (error) {
      console.error('Erro ao avaliar:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    rating,
    averageRating,
    totalRatings,
    setRating,
    loading
  };
}