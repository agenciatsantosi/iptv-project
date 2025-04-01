import React from 'react';
import { Star } from 'lucide-react';
import { useRating } from '../../hooks/useRating';
import { useAuthContext } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface ContentRatingProps {
  contentId: string;
}

export function ContentRating({ contentId }: ContentRatingProps) {
  const { isAuthenticated } = useAuthContext();
  const { rating, averageRating, totalRatings, setRating, loading } = useRating(contentId);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayRating = hoverRating ?? rating ?? 0;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-5 h-5',
                star <= (averageRating || 0)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-gray-400">
          {averageRating?.toFixed(1)} ({totalRatings} avaliações)
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={loading}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-1 hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  star <= displayRating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-400'
                )}
              />
            </button>
          ))}
        </div>
        {rating && (
          <button
            onClick={() => setRating(0)}
            disabled={loading}
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Remover avaliação
          </button>
        )}
      </div>
      <div className="text-sm text-gray-400">
        Média: {averageRating?.toFixed(1)} ({totalRatings} avaliações)
      </div>
    </div>
  );
}