export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  genre: string;
  duration: string;
  year: number;
  rating: string;
  streamUrl: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  genre: string;
  seasons: Season[];
  rating: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  streamUrl: string;
}