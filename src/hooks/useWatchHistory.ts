import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel } from '../types/iptv';

interface WatchHistoryState {
  history: Array<{
    channel: Channel;
    lastWatched: number;
  }>;
  addToHistory: (channel: Channel) => void;
  clearHistory: () => void;
}

export const useWatchHistory = create<WatchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (channel) =>
        set((state) => ({
          history: [
            { channel, lastWatched: Date.now() },
            ...state.history.filter((item) => item.channel.id !== channel.id),
          ].slice(0, 50), // Mantém apenas os últimos 50 canais
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'watch-history',
    }
  )
);