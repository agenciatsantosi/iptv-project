import { Channel } from '../types/iptv';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const PAGE_SIZE = 50;

// Carrega uma página de canais
export async function loadChannels(page: number = 0, filter?: string) {
  try {
    console.log('Carregando canais:', { page, filter });
    
    // Calcular o offset baseado na página
    const offset = page * PAGE_SIZE;
    
    // Construir a query base
    let query = supabase
      .from('channels')
      .select('*', { count: 'exact' });
    
    // Adicionar filtro se existir
    if (filter) {
      query = query.or(`name.ilike.%${filter}%,full_name.ilike.%${filter}%`);
    }
    
    // Adicionar paginação
    query = query
      .range(offset, offset + PAGE_SIZE - 1)
      .order('name');

    // Executar a query
    const { data: channels, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar canais:', error);
      throw error;
    }

    // Formatar os canais
    const formattedChannels = channels?.map(channel => ({
      ...channel,
      logo: channel.logo ? (
        channel.logo.startsWith('http') ? channel.logo :
        channel.logo.startsWith('/') ? channel.logo :
        channel.logo.startsWith('data:') ? channel.logo :
        `/${channel.logo}`
      ) : null,
      group_title: channel.group_title || 'Sem Categoria',
      type: channel.type || determineContentType(channel.group_title, channel.name),
      url: channel.url || channel.stream_url || '',
      stream_url: channel.stream_url || channel.url || '',
    })) || [];

    console.log('Total de canais encontrados:', count);
    console.log('Canais nesta página:', formattedChannels.length);

    return {
      channels: formattedChannels,
      total: count || 0,
      error: null
    };
  } catch (error) {
    console.error('Erro ao carregar canais:', error);
    return {
      channels: [],
      total: 0,
      error: 'Erro ao carregar canais'
    };
  }
}

// Carrega apenas os metadados dos canais (sem URLs)
export async function loadChannelMetadata() {
  try {
    const { data: channels, error } = await supabase
      .from('channels')
      .select('id, name, logo, group_title, type, created_at, updated_at')
      .order('name');

    if (error) {
      console.warn('Aviso: Nenhum canal encontrado no banco de dados');
      return {
        channels: [],
        error: null
      };
    }

    // Formatar os URLs das imagens
    const formattedChannels = channels?.map(channel => ({
      ...channel,
      logo: channel.logo ? (
        channel.logo.startsWith('http') ? channel.logo :
        channel.logo.startsWith('/') ? channel.logo :
        channel.logo.startsWith('data:') ? channel.logo :
        `/${channel.logo}`
      ) : null
    })) || [];

    return {
      channels: formattedChannels,
      error: null
    };
  } catch (error) {
    console.warn('Aviso: Erro ao carregar metadados, retornando lista vazia');
    return {
      channels: [],
      error: null
    };
  }
}

// Sincroniza canais com o Supabase
export async function syncChannels(channels: Channel[]) {
  try {
    console.log('Exemplo de canal formatado:', channels[0]);

    const formattedChannels = channels.map(channel => {
      // Criar um ID consistente baseado no nome do episódio e números de temporada/episódio
      const baseId = `${channel.name}-s${channel.season_number?.toString().padStart(2, '0') || '00'}e${channel.episode_number?.toString().padStart(2, '0') || '00'}`;
      const id = channel.id || baseId.toLowerCase().replace(/[^a-z0-9]/g, '-');

      return {
        id,
        name: channel.name,
        url: channel.url,
        logo: channel.logo || '',
        group_title: channel.group_title || '',
        type: channel.type || 'series',
        season_number: channel.season_number,
        episode_number: channel.episode_number,
        full_name: channel.full_name || channel.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    console.log('Enviando canais para o Supabase:', formattedChannels.length);

    const { error } = await supabase
      .from('channels')
      .upsert(formattedChannels, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Erro do Supabase ao sincronizar:', error);
      throw error;
    }

    console.log('Canais sincronizados com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro ao sincronizar canais:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar canais'
    };
  }
}

// Limpa os canais (não precisa fazer nada, o store já limpa)
export async function clearChannels() {
  return { success: true };
}

// Carrega detalhes de um canal específico
export async function loadChannelDetails(channelId: string) {
  try {
    console.log('Carregando detalhes do canal:', channelId);
    
    // Buscar do Supabase
    const { data: channel, error: dbError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (dbError || !channel) {
      console.error('Erro ao buscar canal:', dbError);
      throw new Error('Canal não encontrado');
    }

    // Formata o canal
    const formattedChannel = {
      ...channel,
      id: channel.id || uuidv4(), // Gerar UUID válido
      name: channel.name || 'Sem nome',
      logo: channel.logo ? (
        channel.logo.startsWith('http') ? channel.logo :
        channel.logo.startsWith('/') ? channel.logo :
        channel.logo.startsWith('data:') ? channel.logo :
        `/${channel.logo}`
      ) : null,
      group_title: channel.group_title || 'Sem Categoria',
      type: channel.type || determineContentType(channel.group_title || 'Sem Categoria', channel.name || 'Sem nome'),
      url: channel.url || channel.stream_url || '',
      stream_url: channel.stream_url || channel.url || '',
      created_at: channel.created_at || new Date().toISOString(),
      updated_at: channel.updated_at || new Date().toISOString()
    };

    console.log('Canal formatado:', formattedChannel);

    return { channel: formattedChannel, error: null };
  } catch (error) {
    console.error('Erro ao carregar detalhes do canal:', error);
    return { channel: null, error: 'Erro ao carregar detalhes do canal' };
  }
}

// Incrementa visualizações de um canal
export async function incrementViews(channelId: string) {
  try {
    // Aqui você precisaria implementar a lógica para incrementar as visualizações do canal em um armazenamento local
    return { error: null };
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
    return { error: 'Erro ao incrementar visualizações' };
  }
}

// Determina o tipo de conteúdo baseado no título e nome
export function determineContentType(groupTitle: string = '', name: string = ''): 'live' | 'movie' | 'series' {
  const lowerGroup = (groupTitle || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();

  // Verifica se é filme
  if (
    lowerGroup.includes('filme') ||
    lowerGroup.includes('movie') ||
    lowerGroup.includes('vod') ||
    lowerGroup.includes('lançamento') ||
    lowerName.includes('1080p') ||
    lowerName.includes('720p') ||
    lowerName.includes('480p') ||
    lowerName.match(/\(\d{4}\)/) // Ano entre parênteses
  ) {
    return 'movie';
  }

  // Verifica se é série
  if (
    lowerGroup.includes('serie') ||
    lowerGroup.includes('series') ||
    lowerName.includes('s01') ||
    lowerName.includes('e01') ||
    lowerName.match(/s\d{2}e\d{2}/) || // Formato SxxExx
    lowerName.match(/temporada/) ||
    lowerName.match(/episodio/)
  ) {
    return 'series';
  }

  // Se não for filme nem série, é live
  return 'live';
}

// Busca episódios de uma série pelo nome da série
export async function loadSeriesEpisodes(seriesName: string) {
  try {
    console.log('Buscando episódios para série:', seriesName);
    
    // Remove números de temporada/episódio e caracteres especiais do nome da série para busca
    const baseSeriesName = seriesName
      .split(/[sS]\d{2}[eE]\d{2}/)[0]
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '');
    
    console.log('Nome base da série para busca:', baseSeriesName);

    // Busca mais flexível usando ilike
    const { data: episodes, error } = await supabase
      .from('channels')
      .select('*')
      .ilike('name', `%${baseSeriesName}%`)
      .order('season_number', { ascending: true, nullsFirst: false })
      .order('episode_number', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Erro ao carregar episódios:', error);
      throw error;
    }

    console.log('Episódios encontrados:', episodes?.map(ep => ({
      id: ep.id,
      name: ep.name,
      season: ep.season_number,
      episode: ep.episode_number
    })));

    return episodes;
  } catch (error) {
    console.error('Erro ao carregar episódios:', error);
    throw error;
  }
}

// Busca uma série pelo slug diretamente do banco de dados
export async function findSeriesBySlug(slug: string) {
  try {
    console.log('Buscando série pelo slug:', slug);
    
    // Normaliza o slug para busca
    const normalizedSlug = slug.toLowerCase().replace(/[^\w-]+/g, '');
    
    // Buscar todas as séries do Supabase (limitado a 1000 para performance)
    const { data: seriesData, error: dbError } = await supabase
      .from('channels')
      .select('*')
      .eq('type', 'series')
      .order('name')
      .limit(1000);

    if (dbError) {
      console.error('Erro ao buscar séries:', dbError);
      throw new Error('Erro ao buscar séries');
    }

    if (!seriesData || seriesData.length === 0) {
      console.warn('Nenhuma série encontrada no banco de dados');
      return { series: null, error: 'Série não encontrada' };
    }

    // Encontrar a série que corresponde ao slug
    const foundSeries = seriesData.find(series => {
      const seriesTitle = series.title || series.name || '';
      const seriesSlug = seriesTitle
        .toLowerCase()
        .replace(/[^\w\s-]+/g, '')
        .trim()
        .replace(/\s+/g, '-');
      
      return seriesSlug === normalizedSlug;
    });

    if (!foundSeries) {
      console.warn(`Série com slug "${slug}" não encontrada entre ${seriesData.length} séries`);
      return { series: null, error: 'Série não encontrada' };
    }

    // Formata a série encontrada
    const formattedSeries = {
      ...foundSeries,
      id: foundSeries.id || uuidv4(),
      logo: foundSeries.logo ? (
        foundSeries.logo.startsWith('http') ? foundSeries.logo :
        foundSeries.logo.startsWith('/') ? foundSeries.logo :
        foundSeries.logo.startsWith('data:') ? foundSeries.logo :
        `/${foundSeries.logo}`
      ) : null,
      group_title: foundSeries.group_title || 'Séries',
      type: 'series',
      url: foundSeries.url || foundSeries.stream_url || '',
      stream_url: foundSeries.stream_url || foundSeries.url || '',
    };

    console.log('Série encontrada:', formattedSeries);

    return { series: formattedSeries, error: null };
  } catch (error) {
    console.error('Erro ao buscar série pelo slug:', error);
    return { series: null, error: 'Erro ao buscar série' };
  }
}

// Busca episódios de uma série pelo nome da série
export async function findSeriesEpisodes(seriesName: string) {
  try {
    console.log('Buscando episódios da série:', seriesName);
    
    if (!seriesName) {
      return { episodes: [], error: 'Nome da série não fornecido' };
    }
    
    // Buscar episódios que contenham o nome da série
    const { data: episodes, error: dbError } = await supabase
      .from('channels')
      .select('*')
      .eq('type', 'series')
      .ilike('name', `%${seriesName}%`)
      .order('name')
      .limit(200);  // Limitado a 200 episódios para performance

    if (dbError) {
      console.error('Erro ao buscar episódios:', dbError);
      throw new Error('Erro ao buscar episódios');
    }

    if (!episodes || episodes.length === 0) {
      console.warn('Nenhum episódio encontrado para a série:', seriesName);
      return { episodes: [], error: null };
    }

    // Formatar os episódios
    const formattedEpisodes = episodes.map(episode => ({
      ...episode,
      id: episode.id || uuidv4(),
      logo: episode.logo ? (
        episode.logo.startsWith('http') ? episode.logo :
        episode.logo.startsWith('/') ? episode.logo :
        episode.logo.startsWith('data:') ? episode.logo :
        `/${episode.logo}`
      ) : null,
      group_title: episode.group_title || 'Séries',
      type: 'series',
      url: episode.url || episode.stream_url || '',
      stream_url: episode.stream_url || episode.url || '',
    }));

    console.log(`Encontrados ${formattedEpisodes.length} episódios para a série:`, seriesName);

    return { episodes: formattedEpisodes, error: null };
  } catch (error) {
    console.error('Erro ao buscar episódios da série:', error);
    return { episodes: [], error: 'Erro ao buscar episódios' };
  }
}
