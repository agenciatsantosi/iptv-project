import { Channel } from '../types/iptv';

// Função auxiliar para limpar o nome do grupo
export function cleanGroupName(group?: string): string {
  if (!group) return 'Sem Grupo';
  
  // Normalizar o nome do grupo
  const normalizedGroup = group.trim();
  
  // Remover prefixos comuns
  return normalizedGroup;
}

// Função para pegar grupos únicos
function getUniqueGroups(channels: Channel[]): string[] {
  const groups = channels
    .map(channel => cleanGroupName(channel.group_title))
    .filter(Boolean);

  return [...new Set(groups)].sort();
}

// Função para categorizar grupos de TV ao vivo
function categorizeGroup(group: string): string {
  const lowerGroup = group.toLowerCase();
  
  // Categorias principais
  if (lowerGroup.includes('brasil') || lowerGroup.includes('brazil')) return 'Brasil';
  if (lowerGroup.includes('esporte') || lowerGroup.includes('sport')) return 'Esportes';
  if (lowerGroup.includes('filme') || lowerGroup.includes('movie')) return 'Filmes';
  if (lowerGroup.includes('document') || lowerGroup.includes('doc')) return 'Documentários';
  if (lowerGroup.includes('infantil') || lowerGroup.includes('kids')) return 'Infantil';
  if (lowerGroup.includes('notícia') || lowerGroup.includes('news')) return 'Notícias';
  if (lowerGroup.includes('música') || lowerGroup.includes('music')) return 'Música';
  if (lowerGroup.includes('variedade') || lowerGroup.includes('variety')) return 'Variedades';
  if (lowerGroup.includes('religioso') || lowerGroup.includes('religious')) return 'Religiosos';
  if (lowerGroup.includes('adulto') || lowerGroup.includes('adult')) return 'Adultos';
  if (lowerGroup.includes('24h') || lowerGroup.includes('24 horas')) return '24 Horas';
  
  // Países e regiões
  if (lowerGroup.includes('usa') || lowerGroup.includes('united states')) return 'EUA';
  if (lowerGroup.includes('latin') || lowerGroup.includes('latino')) return 'América Latina';
  if (lowerGroup.includes('europe') || lowerGroup.includes('europa')) return 'Europa';
  if (lowerGroup.includes('asia') || lowerGroup.includes('ásia')) return 'Ásia';
  
  // Canais específicos
  if (lowerGroup.includes('hbo')) return 'HBO';
  if (lowerGroup.includes('disney')) return 'Disney';
  if (lowerGroup.includes('warner')) return 'Warner';
  if (lowerGroup.includes('fox')) return 'Fox';
  if (lowerGroup.includes('discovery')) return 'Discovery';
  if (lowerGroup.includes('national') || lowerGroup.includes('nat geo')) return 'National Geographic';
  if (lowerGroup.includes('espn')) return 'ESPN';
  if (lowerGroup.includes('globo')) return 'Globo';
  if (lowerGroup.includes('sbt')) return 'SBT';
  if (lowerGroup.includes('record')) return 'Record';
  if (lowerGroup.includes('band')) return 'Band';
  
  // Se não se encaixar em nenhuma categoria, retorna o grupo original
  return group;
}

// Função para pegar grupos de TV ao vivo
export function getLiveGroups(channels: Channel[]): string[] {
  // Obter todos os grupos únicos
  const allGroups = channels
    .map(channel => cleanGroupName(channel.group_title))
    .filter(Boolean);
  
  // Categorizar os grupos
  const categorizedGroups = allGroups.map(categorizeGroup);
  
  // Remover duplicatas e ordenar
  const uniqueGroups = [...new Set(categorizedGroups)].sort();
  
  // Garantir que "Todos" não esteja na lista, pois é adicionado separadamente na UI
  return uniqueGroups.filter(group => group.toLowerCase() !== 'todos');
}

// Função para filtrar canais por grupo
export function filterChannelsByGroup(channels: Channel[], group: string): Channel[] {
  // Se o grupo for uma categoria, precisamos verificar todos os grupos que se encaixam nessa categoria
  const lowerGroup = group.toLowerCase();
  
  return channels.filter(channel => {
    const cleanedGroup = cleanGroupName(channel.group_title);
    const categorizedGroup = categorizeGroup(cleanedGroup);
    
    // Verificar se o grupo categorizado corresponde ao grupo selecionado
    return categorizedGroup === group;
  });
}

// Função para pegar grupos de filmes
export function getMovieGroups(movies: Channel[]): string[] {
  return getUniqueGroups(movies);
}

// Função para pegar grupos de séries
export function getSeriesGroups(series: Channel[]): string[] {
  return getUniqueGroups(series);
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
