import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types/reactions';

export function useComments(contentId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(name)
        `)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComments(data || []);
    } catch (err) {
      setError('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (message: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('comments')
        .insert({ content_id: contentId, message });

      if (error) throw error;

      await fetchComments();
      return true;
    } catch (err) {
      setError('Erro ao adicionar comentário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      return true;
    } catch (err) {
      setError('Erro ao excluir comentário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    deleteComment
  };
}