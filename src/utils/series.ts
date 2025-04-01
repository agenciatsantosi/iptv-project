import { Channel } from '../types/iptv';

export interface Episode {
  id: string;
  url: string;
  season: number;
  episode: number;
  title: string;
  fullTitle: string;
}

export interface Series {
  id: string;
  title: string;
  episodes: Episode[];
  group: string;
  posterPath?: string;
  type: 'series';
}

export function processSeriesName(name: string): { 
  title: string;
  season?: number;
  episode?: number;
} {
  // Remove qualidade e tags entre colchetes/parênteses
  let cleanName = name.replace(/\[.*?\]|\(.*?\)/g, '').trim();

  // Array de padrões para encontrar temporada e episódio
  const patterns = [
    // S01E01, S1E1, etc
    { pattern: /S(\d{1,2})[\s._-]*E(\d{1,2})/i, seasonIndex: 1, episodeIndex: 2 },
    // 1x01, 01x01, etc
    { pattern: /(\d{1,2})x(\d{1,2})/i, seasonIndex: 1, episodeIndex: 2 },
    // Episodio 01, EP 01, etc
    { pattern: /[Ee]p(?:isodio)?[\s._-]*(\d{1,2})/i, seasonIndex: null, episodeIndex: 1 },
    // T01E01, T1E1, etc
    { pattern: /T(\d{1,2})[\s._-]*E(\d{1,2})/i, seasonIndex: 1, episodeIndex: 2 },
    // Temporada 1 Episodio 1
    { pattern: /[Tt]emporada[\s._-]*(\d{1,2})[\s._-]*[Ee]p(?:isodio)?[\s._-]*(\d{1,2})/i, seasonIndex: 1, episodeIndex: 2 }
  ];

  let season: number | undefined;
  let episode: number | undefined;
  let title = cleanName;

  // Tenta cada padrão até encontrar um match
  for (const { pattern, seasonIndex, episodeIndex } of patterns) {
    const match = cleanName.match(pattern);
    if (match) {
      if (seasonIndex) {
        season = parseInt(match[seasonIndex], 10);
      }
      episode = parseInt(match[episodeIndex], 10);
      
      // Remove a parte do episódio do título
      title = cleanName.replace(pattern, '').trim();
      break;
    }
  }

  // Se não encontrou temporada mas encontrou episódio, assume temporada 1
  if (!season && episode) {
    season = 1;
  }

  // Limpa o título removendo caracteres especiais do final
  title = title.replace(/[-._\s]+$/, '').trim();

  console.log('Processando nome da série:', {
    original: name,
    limpo: cleanName,
    resultado: { title, season, episode }
  });

  return { title, season, episode };
}

export function cleanGroupName(group: string | undefined): string {
  if (!group) return 'Sem Categoria';
  return group
    .replace(/^SÉRIES[:|]/i, '')
    .trim();
}

export function getSeriesGroups(channels: Channel[]): string[] {
  const groups = new Set<string>();
  
  channels.forEach(channel => {
    if (channel.group?.toLowerCase().includes('séries') || 
        channel.group?.toLowerCase().includes('series')) {
      groups.add(cleanGroupName(channel.group));
    }
  });

  return Array.from(groups).sort();
}

export function groupSeriesByName(channels: Channel[]): Series[] {
  const seriesMap = new Map<string, Series>();

  // Primeiro passo: Agrupar por nome base
  channels.forEach(channel => {
    // Verifica se é uma série pelo grupo ou tipo
    const isSeriesGroup = channel.group?.toLowerCase().includes('séries') || 
                         channel.group?.toLowerCase().includes('series') ||
                         channel.type === 'series';
    if (!isSeriesGroup) return;

    const { title, season, episode } = processSeriesName(channel.name);
    if (!title) return;

    // Normaliza o título para usar como chave
    const normalizedTitle = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');

    // Cria ou obtém a série
    if (!seriesMap.has(normalizedTitle)) {
      seriesMap.set(normalizedTitle, {
        id: `series-${normalizedTitle.replace(/\s+/g, '-')}`,
        title: title, // Mantém o título original
        episodes: [],
        group: cleanGroupName(channel.group || ''),
        type: 'series'
      });
    }

    const series = seriesMap.get(normalizedTitle)!;

    // Adiciona o episódio mesmo se não tiver informação de temporada/episódio
    const episodeId = season && episode 
      ? `${series.id}-s${season.toString().padStart(2, '0')}e${episode.toString().padStart(2, '0')}`
      : `${series.id}-${channel.id}`;
    
    // Verifica se o episódio já existe
    const existingEpisode = series.episodes.find(ep => 
      ep.id === episodeId || ep.url === channel.url
    );

    if (!existingEpisode) {
      series.episodes.push({
        id: episodeId,
        url: channel.url || '',
        season: season || 1,
        episode: episode || 1,
        title: episode ? `Episódio ${episode}` : channel.name,
        fullTitle: channel.name
      });

      console.log('Adicionando episódio:', {
        serie: title,
        temporada: season,
        episodio: episode,
        id: episodeId
      });
    }
  });

  // Ordena os episódios de cada série
  for (const series of seriesMap.values()) {
    series.episodes.sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.episode - b.episode;
    });
  }

  const result = Array.from(seriesMap.values());

  console.log('Series agrupadas:', {
    total: result.length,
    detalhes: result.map(s => ({
      titulo: s.title,
      episodios: s.episodes.length,
      primeiroEpisodio: s.episodes[0]?.title,
      ultimoEpisodio: s.episodes[s.episodes.length - 1]?.title
    }))
  });

  return result;
}
