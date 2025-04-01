export interface BaseContent {
  id: string;
  name: string;
  logo: string | null;
  group_title: string;
  url: string;
  type: 'live' | 'movie' | 'series';
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  title?: string;
  url: string;
  stream_url?: string;
  logo?: string | null;
  group_title?: string;
  type?: 'live' | 'movie' | 'series';
  group?: string;
  tvg?: {
    id?: string;
    name?: string;
    logo?: string;
    url?: string;
    rec?: string;
  };
  season_number?: number;
  episode_number?: number;
  full_name?: string;
  cast_members?: string[];
  country?: string;
  language?: string;
  director?: string;
  genres?: string[];
  year?: number;
  rating?: string;
  duration?: number;
  description?: string;
  session_number?: string;
  group_name?: string;
  content_reports?: string | null;
  created_at?: string;
  updated_at?: string;
  thumbnailPath?: string;
  poster?: string;
  episodes?: Channel[];
}

export interface Movie extends BaseContent {
  type: 'movie';
  season_number?: number;
  episode_number?: number;
  full_name: string;
  cast_members?: string[];
  country?: string;
  language?: string;
  director?: string;
  genres?: string[];
  year?: number;
  rating?: string;
  duration?: number;
  description?: string;
  session_number?: string;
  group_name?: string;
  content_reports?: string;
}

export interface Series extends BaseContent {
  type: 'series';
  season_number?: number;
  episode_number?: number;
  full_name: string;
  cast_members?: string[];
  country?: string;
  language?: string;
  director?: string;
  genres?: string[];
  year?: number;
  rating?: string;
  duration?: number;
  description?: string;
  session_number?: string;
  group_name?: string;
  content_reports?: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  season: number;
  episode: number;
  name: string;
  url: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

// Função auxiliar para determinar o tipo de conteúdo
export function determineContentType(groupTitle: string, name: string): 'live' | 'movie' | 'series' {
  const lowerGroup = groupTitle?.toLowerCase() || '';
  const lowerName = name?.toLowerCase() || '';

  if (lowerGroup.includes('filme') || 
      lowerGroup.includes('movie') || 
      lowerName.includes('(19') || 
      lowerName.includes('(20')) {
    return 'movie';
  }

  if (lowerGroup.includes('série') || 
      lowerGroup.includes('series') || 
      lowerName.includes(' s0') || 
      lowerName.includes(' e0')) {
    return 'series';
  }

  return 'live';
}

// Função para extrair informações do nome
export function extractContentInfo(name: string, groupTitle: string) {
  const yearMatch = name.match(/\((\d{4})\)/);
  const seasonEpisodeMatch = name.match(/S(\d{1,2})\s*E(\d{1,2})/i);
  const qualityMatch = name.match(/(SD|HD|FHD|UHD)/i);
  const codecMatch = name.match(/H\.26[45]/i);
  const languageMatch = groupTitle.match(/\|(.*?)(\/|$)/);

  // Extrair gêneros do group_title
  const genres = groupTitle
    .split(/[\/|]/)
    .map(g => g.trim())
    .filter(g => g && !g.includes(':'));

  return {
    year: yearMatch ? parseInt(yearMatch[1]) : undefined,
    season_number: seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[1]) : undefined,
    episode_number: seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[2]) : undefined,
    quality: qualityMatch ? qualityMatch[1].toUpperCase() : undefined,
    codec: codecMatch ? codecMatch[0] : undefined,
    language: languageMatch ? languageMatch[1].trim() : undefined,
    genres: genres.length > 0 ? genres : undefined
  };
}

export interface ImportProgress {
  stage: 'downloading' | 'parsing' | 'processing';
  progress: number;
}