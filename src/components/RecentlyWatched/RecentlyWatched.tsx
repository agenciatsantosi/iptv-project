import React from 'react';
import { useWatchHistory } from '@/stores/watchHistoryStore';
import { useNavigate } from 'react-router-dom';

export const RecentlyWatched: React.FC = () => {
  const { getRecentlyWatched } = useWatchHistory();
  const navigate = useNavigate();
  const recentItems = getRecentlyWatched(10);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleItemClick = (item: any) => {
    const route = item.type === 'movie' ? '/movie' : '/series';
    navigate(`${route}/${item.id}`);
  };

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Continuar Assistindo</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recentItems.map((item) => (
          <div 
            key={item.id}
            className="relative group cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            {/* Thumbnail com overlay de progresso */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Overlay com informações */}
              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                <div>
                  <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                  <p className="text-gray-300 text-xs mt-1">
                    {formatDuration(item.currentTime)} / {formatDuration(item.duration)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-white">{item.progress}%</span>
                  <div className="flex-1">
                    <div className="h-1 bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-red-600 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de progresso abaixo do thumbnail */}
            <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
