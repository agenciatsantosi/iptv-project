import React from 'react';
import { useComments } from '../../hooks/useComments';
import { useAuthContext } from '../../contexts/AuthContext';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface CommentSectionProps {
  contentId: string;
}

export function CommentSection({ contentId }: CommentSectionProps) {
  const { isAuthenticated } = useAuthContext();
  const [message, setMessage] = React.useState('');
  const { 
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    deleteComment
  } = useComments(contentId);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const success = await addComment(message);
    if (success) {
      setMessage('');
    }
  };

  if (loading && comments.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Deixe seu comentário..."
            className="w-full px-4 py-2 bg-zinc-800 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 outline-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Comentar'}
          </button>
        </form>
      ) : (
        <p className="text-gray-400 text-center">
          Faça login para deixar seu comentário
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{comment.user?.name}</span>
              <span className="text-sm text-gray-400">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-300">{comment.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}