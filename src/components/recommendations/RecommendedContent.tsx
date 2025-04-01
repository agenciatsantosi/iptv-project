import React from 'react';
import { useRecommendations } from '../../hooks/useRecommendations';
import { ContentCard } from '../iptv/ContentCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useIPTVStore } from '../../store/iptvStore';

export function RecommendedContent() {
  const { recommendations, loading, error } = useRecommendations(12);
  const { favorites, toggleFavorite } = useIPTVStore();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-500/10 p-4 rounded flex items-center justify-center">
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Continue assistindo para receber recomendações personalizadas</p>
        <p className="text-sm mt-2">Enquanto isso, que tal explorar nosso catálogo?</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((content) => (
          <ContentCard
            key={content.id}
            channel={content}
            isFavorite={favorites.includes(content.id)}
            onToggleFavorite={() => toggleFavorite(content.id)}
          />
        ))}
      </div>
    </div>
  );
}