import React, { useState } from 'react';
import {
  ThumbsUp,
  Heart,
  Star,
  MessageCircle,
  Send,
  Smile,
  Frown,
} from 'lucide-react';
import {
  useReactionsStore,
  ReactionType,
} from '../stores/reactionsStore';

interface ContentReactionsProps {
  contentId: string;
  contentType: 'movie' | 'series';
}

const REACTIONS = [
  { type: 'like' as ReactionType, icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
  { type: 'love' as ReactionType, icon: Heart, label: 'Love', color: 'text-red-500' },
  { type: 'wow' as ReactionType, icon: Star, label: 'Wow', color: 'text-yellow-500' },
  { type: 'sad' as ReactionType, icon: Frown, label: 'Sad', color: 'text-purple-500' },
];

export function ContentReactions({ contentId, contentType }: ContentReactionsProps) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showComments, setShowComments] = useState(false);
  
  const {
    addReaction,
    removeReaction,
    addComment,
    addRating,
    getContentReactions,
    getContentComments,
    getContentRating,
  } = useReactionsStore();

  const reactions = getContentReactions(contentId);
  const comments = getContentComments(contentId);
  const userRating = getContentRating(contentId);

  const handleReaction = (type: ReactionType) => {
    const existingReaction = reactions.find((r) => r.type === type);
    if (existingReaction) {
      removeReaction(contentId);
    } else {
      addReaction(contentId, type);
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(contentId, comment);
      setComment('');
    }
  };

  const handleRating = (score: number) => {
    addRating(contentId, score);
    setRating(score);
  };

  return (
    <div className="space-y-6">
      {/* Reactions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
          {REACTIONS.map(({ type, icon: Icon, label, color }) => {
            const isActive = reactions.some((r) => r.type === type);
            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`p-2 rounded-full transition-all ${
                  isActive
                    ? `${color} bg-white/10`
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length} comentários</span>
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            onClick={() => handleRating(score)}
            className={`p-1 transition-colors ${
              (userRating?.score || rating) >= score
                ? 'text-yellow-500'
                : 'text-white/20 hover:text-yellow-500'
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
        {userRating && (
          <span className="text-white/60 text-sm ml-2">
            Sua avaliação: {userRating.score}/5
          </span>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 bg-white/5 rounded-md px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={!comment.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white/5 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Smile className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80">Usuário</span>
                  </div>
                  <span className="text-white/40 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-white/90">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
