import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerSettings {
  defaultQuality: string;
  autoplay: boolean;
  muted: boolean;
}

interface PlayerSettingsStore {
  settings: PlayerSettings;
  updateSettings: (settings: Partial<PlayerSettings>) => void;
}

export const usePlayerSettings = create<PlayerSettingsStore>()(
  persist(
    (set) => ({
      settings: {
        defaultQuality: 'auto',
        autoplay: true,
        muted: false
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
    }),
    {
      name: 'player-settings'
    }
  )
);