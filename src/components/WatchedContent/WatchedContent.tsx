import React, { useMemo } from 'react';
import { useWatchHistory } from '@/stores/watchHistoryStore';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const WatchedContent: React.FC = () => {
  const { history } = useWatchHistory();

  const watchedItems = useMemo(() => {
    return Object.values(history)
      .filter(item => item.progress >= 0.9)
      .sort((a, b) => {
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
      })
      .slice(0, 10); // Mostra apenas os 10 últimos
  }, [history]);

  if (watchedItems.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Assistidos Recentemente</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {watchedItems.map((item) => (
          <Link
            key={item.episodeId ? `${item.id}-${item.episodeId}` : item.id}
            to={item.type === 'series' ? `/series/${item.id}` : `/movies/${item.id}`}
            className="relative group"
          >
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w500${item.thumbnail}`}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">
                    {item.title}
                  </h3>
                  {item.episodeId && (
                    <p className="text-gray-300 text-xs mt-1">
                      Temporada {item.seasonNumber}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {formatDistanceToNow(new Date(item.lastUpdate), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
