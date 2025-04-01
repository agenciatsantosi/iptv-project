import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Comment } from '../../types/tmdb';
import { useIPTVStore } from '../../store/iptvStore';

interface CommentSectionProps {
  contentId: string;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
}

export function CommentSection({ contentId, comments, onAddComment }: CommentSectionProps) {
  const { user } = useAuthContext();
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    onAddComment({
      userId: user.id,
      userName: user.name,
      contentId,
      text: newComment.trim(),
      rating
    });

    setNewComment('');
    setRating(5);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comentários</h3>

      {/* Form de Comentário */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoveredStar ?? rating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="O que você achou?"
            className="w-full p-3 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            rows={3}
          />

          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comentar
          </button>
        </form>
      ) : (
        <p className="text-gray-400">Faça login para deixar seu comentário</p>
      )}

      {/* Lista de Comentários */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{comment.userName}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm">{comment.rating}/5</span>
              </div>
            </div>
            <p className="text-gray-300">{comment.text}</p>
            <span className="text-sm text-gray-400 mt-2 block">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        )}
      </div>
    </div>
  );
}
