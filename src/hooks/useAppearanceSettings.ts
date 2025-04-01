import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppearanceSettings {
  theme: 'system' | 'dark' | 'light';
  reducedMotion: boolean;
}

interface AppearanceSettingsStore {
  settings: AppearanceSettings;
  updateSettings: (settings: Partial<AppearanceSettings>) => void;
}

export const useAppearanceSettings = create<AppearanceSettingsStore>()(
  persist(
    (set) => ({
      settings: {
        theme: 'system',
        reducedMotion: false
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
    }),
    {
      name: 'appearance-settings'
    }
  )
);