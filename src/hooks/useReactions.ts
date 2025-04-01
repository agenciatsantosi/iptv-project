import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ReactionType } from '../types/reactions';

interface ReactionCounts {
  like: number;
  love: number;
  wow: number;
  haha: number;
  sad: number;
  angry: number;
}

export function useReactions(contentId: string) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    like: 0,
    love: 0,
    wow: 0,
    haha: 0,
    sad: 0,
    angry: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [contentId]);

  const fetchReactions = async () => {
    try {
      // Busca reação do usuário
      const { data: userReactionData } = await supabase
        .from('reactions')
        .select('type')
        .eq('content_id', contentId)
        .maybeSingle();

      if (userReactionData) {
        setUserReaction(userReactionData.type as ReactionType);
      }

      // Busca contagem de reações
      const { data: counts } = await supabase
        .from('reactions')
        .select('type, count')
        .eq('content_id', contentId)
        .group('type');

      if (counts) {
        const newCounts = { ...reactionCounts };
        counts.forEach(({ type, count }) => {
          newCounts[type as keyof ReactionCounts] = count;
        });
        setReactionCounts(newCounts);
      }
    } catch (error) {
      console.error('Erro ao buscar reações:', error);
    }
  };

  const addReaction = async (type: ReactionType) => {
    try {
      setLoading(true);

      // Remove reação anterior se existir
      if (userReaction) {
        await removeReaction();
      }

      // Adiciona nova reação
      await supabase
        .from('reactions')
        .insert({ content_id: contentId, type });

      setUserReaction(type);
      await fetchReactions();
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeReaction = async () => {
    try {
      setLoading(true);
      await supabase
        .from('reactions')
        .delete()
        .eq('content_id', contentId);

      setUserReaction(null);
      await fetchReactions();
    } catch (error) {
      console.error('Erro ao remover reação:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    userReaction,
    reactionCounts,
    loading,
    addReaction,
    removeReaction
  };
}