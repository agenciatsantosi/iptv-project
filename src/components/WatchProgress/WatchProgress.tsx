import React from 'react';
import { useWatchHistory } from '@/stores/watchHistoryStore';
import { IoCheckmarkCircle, IoTimeOutline } from 'react-icons/io5';

interface WatchProgressProps {
  contentId: string;
  type: 'movie' | 'series';
  seasonNumber?: number;
}

export const WatchProgress: React.FC<WatchProgressProps> = ({
  contentId,
  type,
  seasonNumber,
}) => {
  const { movies, series } = useWatchHistory();

  if (type === 'movie') {
    const movie = movies[contentId];
    if (!movie?.progress) return null;

    const progress = movie.progress.progress * 100;

    return (
      <div className="flex items-center space-x-2">
        <div className="relative w-full h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">
          {progress.toFixed(0)}%
        </span>
      </div>
    );
  }

  const serie = series[contentId];
  if (!serie) return null;

  if (seasonNumber) {
    const season = serie.seasons[seasonNumber];
    if (!season) return null;

    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {season.watchedEpisodes} de {season.totalEpisodes} episódios
          </span>
          <span className="text-sm text-gray-500">
            {season.progress.toFixed(0)}%
          </span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ width: `${season.progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Progresso Total
        </span>
        <span className="text-sm text-gray-500">
          {serie.totalProgress.toFixed(0)}%
        </span>
      </div>
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${serie.totalProgress}%` }}
        />
      </div>
    </div>
  );
};
