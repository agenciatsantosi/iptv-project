import { useMemo } from 'react';
import { Channel } from '../types/iptv';

interface GroupedSeries {
  id: string;
  name: string;
  episodes: Channel[];
  thumbnailPath?: string;
  logo?: string;
  group_title?: string;
  seasons: Map<number, Channel[]>;
}

// Função para gerar um ID único baseado no nome da série
function generateSeriesId(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/[^\w-]+/g, '');
}

function normalizeSeriesName(title: string): string {
  // Remove sufixos comuns e informações extras
  return title
    .replace(/\s*24HRS²\s*$/, '')
    .replace(/\s*S\d{1,2}.*$/, '')  // Remove S01, S02, etc e tudo depois
    .replace(/\s*T\d{1,2}.*$/, '')  // Remove T01, T02, etc e tudo depois
    .replace(/\s*\d{1,2}x\d{1,2}.*$/, '') // Remove 1x01, etc
    .replace(/\s*EP\s*\d+.*$/i, '') // Remove EP01, etc
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/\s*\[[^\]]*\]\s*/g, '')
    .trim()
    .toUpperCase(); // Normaliza para maiúsculas
}

function extractSeriesInfo(title: string) {
  const normalizedName = normalizeSeriesName(title);
  
  // Padrões para detectar temporada e episódio
  const seasonPattern = /S(\d{1,2})|T(\d{1,2})/i;
  const episodePattern = /E(\d{1,2})|EP(\d{1,2})/i;
  
  const seasonMatch = title.match(seasonPattern);
  const episodeMatch = title.match(episodePattern);
  
  return {
    seriesName: normalizedName,
    seasonNumber: seasonMatch ? parseInt(seasonMatch[1] || seasonMatch[2]) : 1,
    episodeNumber: episodeMatch ? parseInt(episodeMatch[1] || episodeMatch[2]) : 1
  };
}

export function useGroupedSeries(channels: Channel[]) {
  return useMemo(() => {
    const seriesMap = new Map<string, GroupedSeries>();

    // Primeiro passo: agrupar por nome base da série
    channels.forEach(channel => {
      if (!channel.name) return;

      // Função para obter o nome base da série
      const getBaseName = (name: string) => {
        return name
          .replace(/\s*[-–]\s*S\d+.*$/i, '') // Remove tudo após o S01, S02, etc
          .replace(/\s*[-–]\s*Temporada.*$/i, '') // Remove "Temporada X"
          .replace(/\s*[-–]\s*[Ee]pisodio.*$/i, '') // Remove "Episodio X"
          .trim();
      };

      const baseName = getBaseName(channel.name);
      
      if (!seriesMap.has(baseName)) {
        seriesMap.set(baseName, {
          id: channel.id,
          name: baseName,
          episodes: [],
          thumbnailPath: channel.thumbnailPath,
          logo: channel.logo || undefined,
          group_title: channel.group_title,
          seasons: new Map()
        });
      }

      const series = seriesMap.get(baseName)!;
      series.episodes.push(channel);

      // Adicionar à temporada correta
      const season = channel.season_number || 1;
      if (!series.seasons.has(season)) {
        series.seasons.set(season, []);
      }
      series.seasons.get(season)!.push(channel);
    });

    // Segundo passo: ordenar episódios dentro de cada temporada
    seriesMap.forEach(series => {
      series.seasons.forEach(episodes => {
        episodes.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
      });

      // Ordenar as temporadas
      series.seasons = new Map([...series.seasons.entries()].sort((a, b) => a[0] - b[0]));
    });

    // Retornar array ordenado por nome
    return Array.from(seriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [channels]);
}
