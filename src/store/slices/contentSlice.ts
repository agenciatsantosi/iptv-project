import { StateCreator } from 'zustand';
import { Channel } from '../../types/iptv';
import { ContentClassifier } from '../../services/content-classifier';

export interface ContentSlice {
  movies: Channel[];
  series: Channel[];
  live: Channel[];
  setContent: (channels: Channel[]) => void;
  clearContent: () => void;
  getContentStats: () => {
    total: number;
    movies: number;
    series: number;
    live: number;
  };
}

export const createContentSlice: StateCreator<ContentSlice> = (set, get) => ({
  movies: [],
  series: [],
  live: [],
  
  setContent: (channels) => {
    // Clear existing content first
    set({ movies: [], series: [], live: [] });
    
    // Then classify and set new content
    const classified = ContentClassifier.classify(channels);
    set(classified);
  },
  
  clearContent: () => {
    set({ movies: [], series: [], live: [] });
  },

  getContentStats: () => {
    const { movies, series, live } = get();
    return {
      total: movies.length + series.length + live.length,
      movies: movies.length,
      series: series.length,
      live: live.length
    };
  }
});