import { Channel } from '../types/iptv';

// Função auxiliar para limpar o nome do grupo
export function cleanGroupName(group?: string): string {
  if (!group) return 'Sem Grupo';
  return group.trim();
}

// Função para pegar grupos únicos
function getUniqueGroups(channels: Channel[]): string[] {
  const groups = channels
    .map(channel => cleanGroupName(channel.group_title))
    .filter(Boolean);

  return [...new Set(groups)].sort();
}

// Função para filtrar canais por grupo
export function filterChannelsByGroup(channels: Channel[], group: string): Channel[] {
  return channels.filter(channel => cleanGroupName(channel.group_title) === group);
}

// Função para pegar grupos de filmes
export function getMovieGroups(movies: Channel[]): string[] {
  return getUniqueGroups(movies);
}

// Função para pegar grupos de séries
export function getSeriesGroups(series: Channel[]): string[] {
  return getUniqueGroups(series);
}

// Função para pegar grupos de TV ao vivo
export function getLiveGroups(channels: Channel[]): string[] {
  return getUniqueGroups(channels);
}

// Função para agrupar séries pelo nome
export function groupSeriesByName(series: Channel[]): Channel[] {
  const groupedSeries = new Map<string, Channel>();

  series.forEach(serie => {
    const name = serie.name.toLowerCase();
    if (!groupedSeries.has(name)) {
      groupedSeries.set(name, serie);
    }
  });

  return Array.from(groupedSeries.values());
}
