export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  isKidsProfile: boolean;
  preferences: {
    language: string;
    contentRating: string[];
    favoriteGenres: string[];
    autoplayPreviews: boolean;
    autoplayNextEpisode: boolean;
  };
  watchHistory: {
    contentId: string;
    progress: number;
    lastWatched: Date;
  }[];
  watchlist: string[];
  achievements: {
    id: string;
    unlockedAt: Date;
  }[];
}

export interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  addProfile: (profile: Partial<Profile>) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
}
