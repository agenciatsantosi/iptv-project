import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Progress {
  id: string;
  type: 'movie' | 'series';
  title: string;
  currentTime: number;
  duration: number;
  progress: number;
  episodeId?: string;
  seasonNumber?: number;
  lastUpdate: string;
}

interface WatchHistoryState {
  history: Record<string, Progress>;
  updateProgress: (progress: Progress) => void;
  getProgress: (id: string, episodeId?: string) => Progress | null;
  isWatched: (id: string, episodeId?: string) => boolean;
  getSeasonProgress: (seriesId: string, seasonNumber: number) => number;
}

interface WatchProgress {
  currentTime: number;
  duration: number;
  progress: number;
  completed: boolean;
  lastWatched: string;
}

interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  progress?: WatchProgress;
  watched: boolean;
}

interface Season {
  number: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  progress: number;
}

interface Series {
  id: string;
  title: string;
  type: 'series';
  seasons: { [key: number]: Season };
  episodes: { [key: string]: Episode };
  lastWatched?: string;
  totalProgress: number;
}

interface Movie {
  id: string;
  title: string;
  type: 'movie';
  progress?: WatchProgress;
}

interface CustomList {
  id: string;
  name: string;
  items: Array<{ id: string; type: 'movie' | 'series' }>;
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TaggedContent {
  contentId: string;
  contentType: 'movie' | 'series';
  tags: string[];
}

interface WatchHistoryStore {
  // Histórico e Progresso
  movies: { [key: string]: Movie };
  series: { [key: string]: Series };
  recentlyWatched: Array<{ id: string; type: 'movie' | 'series' }>;
  
  // Listas Personalizadas
  customLists: { [key: string]: CustomList };
  tags: { [key: string]: Tag };
  taggedContent: { [key: string]: TaggedContent };
  
  // Notificações
  notifications: Array<{
    id: string;
    type: 'new_episode' | 'continue_watching' | 'recommendation';
    contentId: string;
    message: string;
    date: string;
    read: boolean;
  }>;

  // Ações - Histórico e Progresso
  updateMovieProgress: (movieId: string, progress: Partial<WatchProgress>) => void;
  updateEpisodeProgress: (seriesId: string, episodeId: string, progress: Partial<WatchProgress>) => void;
  markEpisodeAsWatched: (seriesId: string, episodeId: string) => void;
  markSeasonAsWatched: (seriesId: string, seasonNumber: number) => void;
  
  // Ações - Listas e Tags
  createCustomList: (name: string) => string;
  addToList: (listId: string, contentId: string, contentType: 'movie' | 'series') => void;
  removeFromList: (listId: string, contentId: string) => void;
  createTag: (name: string, color: string) => string;
  addTag: (contentId: string, contentType: 'movie' | 'series', tagId: string) => void;
  removeTag: (contentId: string, tagId: string) => void;
  
  // Ações - Notificações
  addNotification: (notification: Omit<WatchHistoryStore['notifications'][0], 'id' | 'date' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

export const useWatchHistory = create<WatchHistoryStore & WatchHistoryState>()(
  persist(
    (set, get) => ({
      movies: {},
      series: {},
      recentlyWatched: [],
      customLists: {},
      tags: {},
      taggedContent: {},
      notifications: [],
      history: {},

      updateMovieProgress: (movieId, progress) => {
        set((state) => {
          const movie = state.movies[movieId];
          if (!movie) return state;

          const updatedProgress = {
            ...movie.progress,
            ...progress,
            lastWatched: new Date().toISOString(),
          };

          // Atualizar recently watched
          const recentlyWatched = [
            { id: movieId, type: 'movie' as const },
            ...state.recentlyWatched.filter(item => item.id !== movieId),
          ].slice(0, 20);

          return {
            movies: {
              ...state.movies,
              [movieId]: {
                ...movie,
                progress: updatedProgress,
              },
            },
            recentlyWatched,
          };
        });
      },

      updateEpisodeProgress: (seriesId, episodeId, progress) => {
        set((state) => {
          const series = state.series[seriesId];
          if (!series) return state;

          const episode = series.episodes[episodeId];
          if (!episode) return state;

          const updatedEpisode = {
            ...episode,
            progress: {
              ...episode.progress,
              ...progress,
              lastWatched: new Date().toISOString(),
            },
            watched: progress.progress >= 0.9,
          };

          // Atualizar progresso da temporada
          const seasonNumber = episode.seasonNumber;
          const seasonEpisodes = Object.values(series.episodes).filter(
            ep => ep.seasonNumber === seasonNumber
          );
          
          const watchedEpisodes = seasonEpisodes.filter(ep => ep.watched).length;
          const totalEpisodes = seasonEpisodes.length;
          
          const updatedSeason = {
            ...series.seasons[seasonNumber],
            watchedEpisodes,
            progress: (watchedEpisodes / totalEpisodes) * 100,
          };

          // Atualizar progresso total da série
          const allEpisodes = Object.values(series.episodes);
          const totalProgress = (allEpisodes.filter(ep => ep.watched).length / allEpisodes.length) * 100;

          // Atualizar recently watched
          const recentlyWatched = [
            { id: seriesId, type: 'series' as const },
            ...state.recentlyWatched.filter(item => item.id !== seriesId),
          ].slice(0, 20);

          return {
            series: {
              ...state.series,
              [seriesId]: {
                ...series,
                episodes: {
                  ...series.episodes,
                  [episodeId]: updatedEpisode,
                },
                seasons: {
                  ...series.seasons,
                  [seasonNumber]: updatedSeason,
                },
                totalProgress,
                lastWatched: new Date().toISOString(),
              },
            },
            recentlyWatched,
          };
        });
      },

      markEpisodeAsWatched: (seriesId, episodeId) => {
        set((state) => {
          const series = state.series[seriesId];
          if (!series) return state;

          const episode = series.episodes[episodeId];
          if (!episode) return state;

          const updatedEpisode = {
            ...episode,
            watched: true,
            progress: {
              currentTime: episode.progress?.duration || 0,
              duration: episode.progress?.duration || 0,
              progress: 1,
              completed: true,
              lastWatched: new Date().toISOString(),
            },
          };

          const updatedSeries = {
            ...series,
            episodes: {
              ...series.episodes,
              [episodeId]: updatedEpisode,
            },
          };

          // Atualiza o progresso da temporada
          const seasonProgress = calculateSeasonProgress(updatedSeries, episode.seasonNumber);
          updatedSeries.seasons = {
            ...updatedSeries.seasons,
            [episode.seasonNumber]: {
              ...updatedSeries.seasons?.[episode.seasonNumber],
              number: episode.seasonNumber,
              progress: seasonProgress,
              watchedEpisodes: Object.values(updatedSeries.episodes)
                .filter(ep => ep.seasonNumber === episode.seasonNumber && ep.watched).length,
              totalEpisodes: Object.values(updatedSeries.episodes)
                .filter(ep => ep.seasonNumber === episode.seasonNumber).length,
            },
          };

          // Atualiza o progresso total da série
          const totalEpisodes = Object.values(updatedSeries.episodes).length;
          const watchedEpisodes = Object.values(updatedSeries.episodes).filter(ep => ep.watched).length;
          updatedSeries.totalProgress = (watchedEpisodes / totalEpisodes) * 100;

          return {
            ...state,
            series: {
              ...state.series,
              [seriesId]: updatedSeries,
            },
          };
        });
      },

      markSeasonAsWatched: (seriesId, seasonNumber) => {
        set((state) => {
          const series = state.series[seriesId];
          if (!series) return state;

          const seasonEpisodes = Object.entries(series.episodes).filter(
            ([_, ep]) => ep.seasonNumber === seasonNumber
          );

          const updatedEpisodes = seasonEpisodes.reduce((acc, [id, episode]) => ({
            ...acc,
            [id]: {
              ...episode,
              watched: true,
              progress: {
                ...episode.progress,
                progress: 1,
                completed: true,
                lastWatched: new Date().toISOString(),
              },
            },
          }), {});

          return {
            series: {
              ...state.series,
              [seriesId]: {
                ...series,
                episodes: {
                  ...series.episodes,
                  ...updatedEpisodes,
                },
                seasons: {
                  ...series.seasons,
                  [seasonNumber]: {
                    ...series.seasons[seasonNumber],
                    watchedEpisodes: seasonEpisodes.length,
                    progress: 100,
                  },
                },
              },
            },
          };
        });
      },

      createCustomList: (name) => {
        const id = `list_${Date.now()}`;
        set((state) => ({
          customLists: {
            ...state.customLists,
            [id]: {
              id,
              name,
              items: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
        return id;
      },

      addToList: (listId, contentId, contentType) => {
        set((state) => {
          const list = state.customLists[listId];
          if (!list) return state;

          return {
            customLists: {
              ...state.customLists,
              [listId]: {
                ...list,
                items: [...list.items, { id: contentId, type: contentType }],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      removeFromList: (listId, contentId) => {
        set((state) => {
          const list = state.customLists[listId];
          if (!list) return state;

          return {
            customLists: {
              ...state.customLists,
              [listId]: {
                ...list,
                items: list.items.filter(item => item.id !== contentId),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      createTag: (name, color) => {
        const id = `tag_${Date.now()}`;
        set((state) => ({
          tags: {
            ...state.tags,
            [id]: { id, name, color },
          },
        }));
        return id;
      },

      addTag: (contentId, contentType, tagId) => {
        set((state) => {
          const existing = state.taggedContent[contentId] || {
            contentId,
            contentType,
            tags: [],
          };

          return {
            taggedContent: {
              ...state.taggedContent,
              [contentId]: {
                ...existing,
                tags: [...new Set([...existing.tags, tagId])],
              },
            },
          };
        });
      },

      removeTag: (contentId, tagId) => {
        set((state) => {
          const content = state.taggedContent[contentId];
          if (!content) return state;

          return {
            taggedContent: {
              ...state.taggedContent,
              [contentId]: {
                ...content,
                tags: content.tags.filter(id => id !== tagId),
              },
            },
          };
        });
      },

      addNotification: (notification) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notification_${Date.now()}`,
              date: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        }));
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      calculateSeasonProgress: (series: Series, seasonNumber: number): number => {
        const seasonEpisodes = Object.values(series.episodes || {}).filter(
          ep => ep.seasonNumber === seasonNumber
        );
        
        if (seasonEpisodes.length === 0) return 0;

        const watchedCount = seasonEpisodes.filter(ep => ep.watched || (ep.progress?.progress || 0) >= 0.9).length;
        return (watchedCount / seasonEpisodes.length) * 100;
      },

      updateProgress: (progress) => {
        const { id, type, episodeId, seasonNumber } = progress;
        
        if (type === 'series' && episodeId && seasonNumber) {
          set((state) => {
            const series = state.series[id] || {
              id,
              title: progress.title,
              type: 'series',
              episodes: {},
              seasons: {},
              totalProgress: 0,
            };

            const isCompleted = progress.progress >= 0.9;
            
            // Atualiza o episódio
            const updatedEpisode = {
              id: episodeId,
              seasonNumber,
              watched: isCompleted,
              progress: {
                currentTime: progress.currentTime,
                duration: progress.duration,
                progress: progress.progress,
                completed: isCompleted,
                lastWatched: progress.lastUpdate,
              },
            };

            const updatedSeries = {
              ...series,
              episodes: {
                ...series.episodes,
                [episodeId]: updatedEpisode,
              },
            };

            // Atualiza o progresso da temporada
            const seasonProgress = calculateSeasonProgress(updatedSeries, seasonNumber);
            updatedSeries.seasons = {
              ...updatedSeries.seasons,
              [seasonNumber]: {
                number: seasonNumber,
                progress: seasonProgress,
                watchedEpisodes: Object.values(updatedSeries.episodes)
                  .filter(ep => ep.seasonNumber === seasonNumber && ep.watched).length,
                totalEpisodes: Object.values(updatedSeries.episodes)
                  .filter(ep => ep.seasonNumber === seasonNumber).length,
              },
            };

            // Atualiza o progresso total da série
            const totalEpisodes = Object.values(updatedSeries.episodes).length;
            const watchedEpisodes = Object.values(updatedSeries.episodes).filter(ep => ep.watched).length;
            updatedSeries.totalProgress = (watchedEpisodes / totalEpisodes) * 100;

            return {
              ...state,
              series: {
                ...state.series,
                [id]: updatedSeries,
              },
            };
          });
        }
      },

      getProgress: (id, episodeId) => {
        const key = episodeId ? `${id}-${episodeId}` : id;
        return get().history[key] || null;
      },

      isWatched: (id, episodeId) => {
        const progress = get().getProgress(id, episodeId);
        return progress ? progress.progress >= 0.9 : false;
      },

      getSeasonProgress: (seriesId, seasonNumber) => {
        const history = get().history;
        const seasonEpisodes = Object.values(history).filter(
          (p) => p.id === seriesId && 
                 p.seasonNumber === seasonNumber
        );

        if (seasonEpisodes.length === 0) return 0;

        const watchedEpisodes = seasonEpisodes.filter(
          (p) => p.progress >= 0.9
        ).length;

        return watchedEpisodes / seasonEpisodes.length;
      },
    }),
    {
      name: 'watch-history-store',
      version: 1,
    }
  )
);
