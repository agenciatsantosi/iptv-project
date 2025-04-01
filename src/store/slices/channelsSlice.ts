import { StateCreator } from 'zustand';
import { Channel } from '../../types/iptv';

export interface ChannelsSlice {
  channels: Channel[];
  activeList: string | null;
  addChannels: (channels: Channel[], source: string) => void;
  clearChannels: () => void;
  hasActiveList: () => boolean;
}

export const createChannelsSlice: StateCreator<ChannelsSlice> = (set, get) => ({
  channels: [],
  activeList: null,
  
  addChannels: (channels, source) => {
    set({ 
      channels,
      activeList: source
    });
  },
  
  clearChannels: () => {
    set({ 
      channels: [],
      activeList: null
    });
  },

  hasActiveList: () => {
    const { activeList } = get();
    return activeList !== null;
  }
});