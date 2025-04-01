import { Channel } from '../types/iptv';

interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
  url: string;
  group_title?: string;
}

interface Series {
  id: string;
  title: string;
  episodes: Episode[];
  poster?: string;
  logo?: string;
  thumbnail?: string;
  group_title?: string;
}

function extractEpisodeInfo(title: string): { 
  seriesName: string;
  season?: number;
  episode?: number;
} {
  // Limpar o título
  let cleanTitle = title
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove texto entre parênteses
    .replace(/\s*\[[^\]]*\]\s*/g, '') // Remove texto entre colchetes
    .trim();

  // Log para debug
  console.log('Processando título:', {
    original: title,
    limpo: cleanTitle
  });

  // Padrões comuns de episódios
  const patterns = [
    // S01E01, S1E1, etc
    /^(.*?)\s*[Ss](\d{1,2})\s*[Ee](\d{1,2})/,
    // 1x01, 01x01, etc
    /^(.*?)\s*(\d{1,2})x(\d{1,2})/,
    // Temporada 1 Episodio 1, etc
    /^(.*?)\s*[Tt]emporada\s*(\d{1,2})\s*[Ee]pis[oó]dio\s*(\d{1,2})/,
    // T1 EP1, etc
    /^(.*?)\s*[Tt](\d{1,2})\s*[Ee][Pp]\s*(\d{1,2})/,
    // EP 01, EP01, etc
    /^(.*?)\s*[Ee][Pp]\s*(\d{1,2})/,
    // Episodio 01, etc
    /^(.*?)\s*[Ee]pis[oó]dio\s*(\d{1,2})/,
    // Apenas números no final
    /^(.*?)\s+(\d{1,2})$/
  ];

  for (const pattern of patterns) {
    const match = cleanTitle.match(pattern);
    if (match) {
      // Log para debug
      console.log('Padrão encontrado:', {
        pattern: pattern.toString(),
        grupos: match
      });

      // Se o padrão não tem temporada explícita, assume temporada 1
      if (match.length === 3 && !cleanTitle.toLowerCase().includes('temporada')) {
        return {
          seriesName: match[1].trim(),
          season: 1,
          episode: parseInt(match[2])
        };
      }

      return {
        seriesName: match[1].trim(),
        season: parseInt(match[2]),
        episode: parseInt(match[3] || match[2])
      };
    }
  }

  // Se não encontrou padrão, procura por temporada separadamente
  const seasonMatch = cleanTitle.match(/[Tt]emporada\s*(\d{1,2})/);
  if (seasonMatch) {
    const season = parseInt(seasonMatch[1]);
    const titleWithoutSeason = cleanTitle.replace(/[Tt]emporada\s*\d{1,2}/, '').trim();
    
    // Procura por número de episódio
    const episodeMatch = titleWithoutSeason.match(/(\d{1,2})\s*$/);
    if (episodeMatch) {
      const episode = parseInt(episodeMatch[1]);
      const seriesName = titleWithoutSeason.replace(/\d{1,2}\s*$/, '').trim();
      
      return {
        seriesName,
        season,
        episode
      };
    }
  }

  // Se não encontrou padrão, retorna só o título
  console.log('Nenhum padrão encontrado para:', cleanTitle);
  return {
    seriesName: cleanTitle
  };
}

export function groupSeries(channels: Channel[]): Series[] {
  const seriesMap = new Map<string, Series>();

  // Log para debug
  console.log('Iniciando agrupamento de séries:', {
    totalCanais: channels.length,
    exemplos: channels.slice(0, 3).map(c => c.name)
  });

  channels.forEach(channel => {
    if (!channel.name) {
      console.warn('Canal sem nome encontrado:', channel);
      return;
    }

    const info = extractEpisodeInfo(channel.name);
    
    if (!info.seriesName) {
      console.warn('Não foi possível extrair nome da série:', channel.name);
      return;
    }

    // Normalizar o nome da série para evitar duplicatas
    const normalizedName = info.seriesName.toLowerCase().trim();
    
    // Criar ou obter série
    if (!seriesMap.has(normalizedName)) {
      const seriesId = `${normalizedName}-${Date.now()}`.replace(/[^a-z0-9-]/g, '-');
      seriesMap.set(normalizedName, {
        id: seriesId,
        title: info.seriesName,
        episodes: [],
        poster: channel.poster,
        logo: channel.logo,
        thumbnail: channel.thumbnail,
        group_title: channel.group_title
      });

      console.log('Nova série criada:', {
        nome: info.seriesName,
        id: seriesId
      });
    }

    const series = seriesMap.get(normalizedName)!;

    // Se não tem informação de temporada/episódio, tenta extrair do título
    if (info.season === undefined || info.episode === undefined) {
      // Tenta encontrar números no título
      const numbers = channel.name.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        info.episode = parseInt(numbers[numbers.length - 1]);
        info.season = numbers.length > 1 ? parseInt(numbers[0]) : 1;
      } else {
        info.season = 1;
        info.episode = series.episodes.length + 1;
      }
    }

    // Adicionar episódio
    const episodeExists = series.episodes.some(
      ep => ep.season === info.season && ep.episode === info.episode
    );

    if (!episodeExists) {
      const episodeId = `${series.id}_s${info.season}e${info.episode}`;
      series.episodes.push({
        id: episodeId,
        title: channel.name,
        season: info.season!,
        episode: info.episode!,
        url: channel.url || '',
        group_title: channel.group_title
      });

      console.log('Novo episódio adicionado:', {
        serie: info.seriesName,
        temporada: info.season,
        episodio: info.episode,
        id: episodeId
      });
    }
  });

  // Converter map para array e ordenar episódios
  const result = Array.from(seriesMap.values())
    .map(series => ({
      ...series,
      episodes: series.episodes.sort((a, b) => {
        if (a.season !== b.season) {
          return a.season - b.season;
        }
        return a.episode - b.episode;
      })
    }))
    .filter(series => series.episodes.length > 0); // Remover séries sem episódios

  // Log do resultado final
  console.log('Agrupamento concluído:', {
    totalSeries: result.length,
    exemplos: result.slice(0, 3).map(s => ({
      nome: s.title,
      episodios: s.episodes.length
    }))
  });

  return result;
}
