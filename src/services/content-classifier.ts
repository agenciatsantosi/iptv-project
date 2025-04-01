import { Channel } from '../types/iptv';

interface ClassifiedContent {
  movies: Channel[];
  series: Channel[];
  live: Channel[];
  exemplos: {
    movies: string[];
    series: string[];
    live: string[];
  };
}

export function classifyContent(channels: Channel[]): ClassifiedContent {
  console.log('Iniciando classificação de conteúdo...', {
    totalCanais: channels.length,
    primeirosCanais: channels.slice(0, 3).map(c => ({
      nome: c.name,
      grupo: c.group_title,
      tipo: c.type
    }))
  });

  const result: ClassifiedContent = {
    movies: [],
    series: [],
    live: [],
    exemplos: {
      movies: [],
      series: [],
      live: []
    }
  };

  // Padrões para detectar séries
  const seriesPatterns = [
    /[sS]\d+\s*[eE]\d+/,   // S5 E11, S05E11, S5E11
    /[sS]\d{2}[eE]\d{2}/,  // S01E01
    /[tT]emporada\s*\d+/i, // Temporada 1
    /[eE]pisodio\s*\d+/i,  // Episodio 1
    /[eE]p\s*\d+/i,        // Ep 1
    /[cC]ap[íi]tulo\s*\d+/i // Capítulo 1
  ];

  for (const channel of channels) {
    const name = channel.name?.toLowerCase() || '';
    const group = channel.group_title?.toLowerCase() || '';

    console.log('Classificando canal:', {
      nome: name,
      grupo: group,
      matchSeries: seriesPatterns.some(pattern => pattern.test(name)),
      matchFilme: group.includes('filme') || group.includes('movies'),
    });

    // Detecta séries
    const isSeries = seriesPatterns.some(pattern => pattern.test(name)) ||
                    group.includes('serie') ||
                    group.includes('séries') ||
                    group.includes('paramount') ||  // Adiciona Paramount como série
                    channel.type === 'series';

    if (isSeries) {
      result.series.push(channel);
      if (result.exemplos.series.length < 5) {
        result.exemplos.series.push(channel.name);
      }
      continue;
    }

    // Detecta filmes
    if (group.includes('filme') || 
        group.includes('movies') || 
        group.includes('vod') ||    // Adiciona VOD como filme
        channel.type === 'movie') {
      result.movies.push(channel);
      if (result.exemplos.movies.length < 5) {
        result.exemplos.movies.push(channel.name);
      }
      continue;
    }

    // Se tem "ao vivo" ou "live" no grupo, é TV ao vivo
    if (group.includes('ao vivo') || 
        group.includes('live') || 
        group.includes('tv')) {
      result.live.push(channel);
      if (result.exemplos.live.length < 5) {
        result.exemplos.live.push(channel.name);
      }
      continue;
    }

    // Se chegou aqui e tem um padrão que parece série, coloca em séries
    if (name.match(/[sS]\d+|[tT]emporada|[eE]pisodio|[eE]p\s*\d+/)) {
      result.series.push(channel);
      if (result.exemplos.series.length < 5) {
        result.exemplos.series.push(channel.name);
      }
      continue;
    }

    // Se não identificou em nenhuma categoria específica, coloca em TV ao vivo
    result.live.push(channel);
    if (result.exemplos.live.length < 5) {
      result.exemplos.live.push(channel.name);
    }
  }

  console.log('Classificação concluída:', {
    total: channels.length,
    series: {
      total: result.series.length,
      exemplos: result.exemplos.series
    },
    filmes: {
      total: result.movies.length,
      exemplos: result.exemplos.movies
    },
    aoVivo: {
      total: result.live.length,
      exemplos: result.exemplos.live
    }
  });

  return result;
}