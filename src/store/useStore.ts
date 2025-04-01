import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie, Series, WatchProgress } from './types';

interface StoreState {
  version: number;
  watchlist: (Movie | Series)[];
  continueWatching: WatchProgress[];
  addToWatchlist: (item: Movie | Series) => void;
  removeFromWatchlist: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      version: 1,
      watchlist: [],
      continueWatching: [],
      addToWatchlist: (item) =>
        set((state) => ({
          watchlist: state.watchlist.some((i) => i.id === item.id)
            ? state.watchlist
            : [...state.watchlist, item],
        })),
      removeFromWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== id),
        })),
      updateProgress: (id, progress) =>
        set((state) => ({
          continueWatching: [
            ...state.continueWatching.filter((item) => item.id !== id),
            { id, progress, timestamp: Date.now() },
          ],
        })),
    }),
    {
      name: 'streaming-store',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            version: 1,
            watchlist: persistedState.watchlist || [],
            continueWatching: persistedState.continueWatching || []
          };
        }
        return persistedState;
      }
    }
  )
);