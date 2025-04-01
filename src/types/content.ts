export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  previewUrl?: string;
  streamUrl: string;
  type: 'movie' | 'series' | 'live';
  genres: string[];
  rating: string;
  year: number;
  duration?: string;
  cast?: string[];
  director?: string;
  episodeCount?: number;
  seasonCount?: number;
  language: string;
  quality: string;
  featured?: boolean;
}

export interface FeaturedContent extends Content {
  tagline?: string;
  highlightText?: string;
  previewDuration?: number;
  startAt?: number;
}
