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
export async function incrementViews() {
  try {
    // Aqui você precisaria implementar a lógica para incrementar as visualizações do canal em um armazenamento local
    return { error: null };
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
    return { error: 'Erro ao incrementar visualizações' };
  }
}

// Determina o tipo de conteúdo baseado no título e nome
export function determineContentType(name: string = '', groupTitle: string = ''): 'live' | 'movie' | 'series' {
  // Normalizar os textos para comparação
  const lowerName = name.toLowerCase();
  const lowerGroup = groupTitle.toLowerCase();

  // Verificar casos específicos primeiro - 1883 é sempre série
  if (lowerName.includes('1883')) {
    return 'series';
  }

  // Lista de códigos de país comuns em listas IPTV
  const countryCodes = [
    'pt', 'br', 'us', 'uk', 'fr', 'es', 'it', 'de', 'ca', 'mx', 
    'ar', 'cl', 'co', 'pe', 'jp', 'kr', 'cn', 'ru', 'in', 'au', 
    'nz', 'za', 'nl', 'be', 'ch', 'at', 'pl', 'se', 'no', 'dk', 
    'fi', 'gr', 'tr', 'ae', 'sa', 'eg', 'il', 'sg', 'my', 'th',
    'vn', 'ph', 'id', 'ie', 'is', 'lu', 'cz', 'sk', 'hu', 'ro',
    'bg', 'hr', 'rs', 'si', 'ee', 'lv', 'lt', 'ua', 'by', 'md',
    'ge', 'am', 'az', 'kz', 'uz', 'tm', 'kg', 'tj', 'mn', 'hk',
    'tw', 'mo', 'la', 'kh', 'mm', 'np', 'bd', 'lk', 'pk', 'af',
    'ir', 'iq', 'sy', 'jo', 'lb', 'ps', 'cy', 'mt', 'al', 'mk',
    'ba', 'me', 'li', 'mc', 'sm', 'va', 'ad', 'gi', 'im', 'je',
    'gg', 'fo', 'gl', 'ax', 'pm', 'nc', 'pf', 'wf', 'yt', 're',
    'gp', 'mq', 'gf', 'bl', 'mf', 'sx'
  ];

  // Lista de nomes de países comuns em group-title
  const countryNames = [
    'portugal', 'brasil', 'brazil', 'usa', 'united states', 'estados unidos',
    'united kingdom', 'reino unido', 'england', 'inglaterra', 'scotland', 'escócia',
    'france', 'frança', 'spain', 'españa', 'espanha', 'italy', 'italia', 'itália',
    'germany', 'alemanha', 'deutschland', 'canada', 'mexico', 'méxico',
    'argentina', 'chile', 'colombia', 'colômbia', 'peru', 'perú',
    'japan', 'japão', 'japao', 'korea', 'coreia', 'china', 'russia', 'rússia',
    'india', 'índia', 'australia', 'austrália', 'new zealand', 'nova zelândia',
    'south africa', 'áfrica do sul', 'netherlands', 'holanda', 'países baixos',
    'belgium', 'bélgica', 'switzerland', 'suíça', 'austria', 'áustria',
    'poland', 'polônia', 'sweden', 'suécia', 'norway', 'noruega',
    'denmark', 'dinamarca', 'finland', 'finlândia', 'greece', 'grécia',
    'turkey', 'turquia', 'uae', 'emirates', 'emirados', 'saudi', 'arábia',
    'egypt', 'egito', 'israel', 'singapore', 'singapura', 'malaysia', 'malásia',
    'thailand', 'tailândia', 'vietnam', 'vietnã', 'philippines', 'filipinas',
    'indonesia', 'indonésia', 'ireland', 'irlanda', 'iceland', 'islândia',
    'luxembourg', 'luxemburgo', 'czech', 'república tcheca', 'slovakia', 'eslováquia',
    'hungary', 'hungria', 'romania', 'romênia', 'bulgaria', 'bulgária',
    'croatia', 'croácia', 'serbia', 'sérvia', 'slovenia', 'eslovênia',
    'estonia', 'estônia', 'latvia', 'letônia', 'lithuania', 'lituânia',
    'ukraine', 'ucrânia', 'belarus', 'bielorrússia', 'moldova', 'moldávia',
    'georgia', 'geórgia', 'armenia', 'armênia', 'azerbaijan', 'azerbaijão',
    'kazakhstan', 'cazaquistão', 'uzbekistan', 'uzbequistão', 'turkmenistan', 'turcomenistão',
    'kyrgyzstan', 'quirguistão', 'tajikistan', 'tajiquistão', 'mongolia', 'mongólia',
    'hong kong', 'taiwan', 'macao', 'macau', 'laos', 'cambodia', 'camboja',
    'myanmar', 'birmânia', 'nepal', 'bangladesh', 'sri lanka', 'pakistan', 'paquistão',
    'afghanistan', 'afeganistão', 'iran', 'irã', 'iraq', 'iraque', 'syria', 'síria',
    'jordan', 'jordânia', 'lebanon', 'líbano', 'palestine', 'palestina', 'cyprus', 'chipre',
    'malta', 'albania', 'albânia', 'macedonia', 'macedônia', 'bosnia', 'bósnia',
    'montenegro', 'liechtenstein', 'monaco', 'mônaco', 'san marino', 'vatican', 'vaticano',
    'andorra', 'gibraltar', 'isle of man', 'jersey', 'guernsey', 'faroe', 'ilhas faroé',
    'greenland', 'groenlândia', 'aland', 'åland', 'saint pierre', 'new caledonia', 'nova caledônia',
    'french polynesia', 'polinésia francesa', 'wallis', 'futuna', 'mayotte', 'reunion', 'reunião',
    'guadeloupe', 'martinique', 'french guiana', 'guiana francesa', 'saint barthélemy',
    'saint martin', 'sint maarten', 'latino', 'latin', 'américa latina'
  ];

  // Detectar canais com prefixo de país (PT |, BR |, etc.)
  // Verificar se o nome começa com um código de país seguido de barra vertical
  const hasCountryPrefix = countryCodes.some(code => 
    lowerName.match(new RegExp(`^${code}\\s*\\|`))
  );
  
  // Verificar se o grupo é um nome de país conhecido
  const isCountryGroup = countryNames.some(country => 
    lowerGroup === country || lowerGroup.includes(country)
  );

  // Depuração para o caso específico PT | AFRO MUSIC com group-title=PORTUGAL
  if (name.includes('AFRO MUSIC') || groupTitle === 'PORTUGAL') {
    console.log('Detecção de canal:', {
      nome: name,
      grupo: groupTitle,
      temPrefixoPais: hasCountryPrefix,
      eGrupoPais: isCountryGroup,
      resultado: (hasCountryPrefix || isCountryGroup) ? 'live' : 'outro'
    });
  }

  if (
    (hasCountryPrefix || 
    lowerName.includes('(opcao') || // Canais com opções alternativas
    lowerName.includes('(opc') ||
    isCountryGroup) &&
    !lowerName.includes('1080p') && // Excluir filmes que possam ter prefixo de país
    !lowerName.includes('720p') &&
    !lowerName.match(/s\d{2}e\d{2}/) // Excluir séries que possam ter prefixo de país
  ) {
    return 'live';
  }

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
    lowerGroup.includes('série') ||
    lowerName.includes('s01') ||
    lowerName.includes('e01') ||
    lowerName.match(/s\d{2}e\d{2}/) || // Formato SxxExx
    lowerName.match(/temporada/) ||
    lowerName.match(/episodio/) ||
    lowerName.match(/capítulo/) ||
    // Verificar se o nome parece ser uma série (padrões adicionais)
    lowerName.match(/\d+x\d+/) || // Formato 1x01
    (lowerName.match(/^\d{4}$/) && !lowerName.match(/^\d{4} ao vivo$/)) // Apenas 4 dígitos (ano) e não é "ao vivo"
  ) {
    return 'series';
  }

  // Verifica se é canal ao vivo
  if (
    lowerGroup.includes('tv') ||
    lowerGroup.includes('canal') ||
    lowerGroup.includes('ao vivo') ||
    lowerGroup.includes('live') ||
    lowerGroup.includes('sport') ||
    lowerGroup.includes('esporte') ||
    lowerGroup.includes('news') ||
    lowerGroup.includes('notícia') ||
    lowerGroup.includes('music') ||
    lowerGroup.includes('música') ||
    lowerName.includes('tv') ||
    lowerName.includes('canal') ||
    lowerName.includes('ao vivo') ||
    lowerName.includes('live')
  ) {
    return 'live';
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
export async function findSeriesBySlug(slug: string): Promise<Channel | null> {
  if (!slug) return null;
  
  const debug = false; // Desabilitar logs de depuração
  const normalizedSlug = slug.toLowerCase().trim();
  
  if (debug) console.log(`Buscando série pelo slug: ${normalizedSlug}`);
  
  // Verificar cache primeiro
  const cachedSeries = localStorage.getItem(`series-${normalizedSlug}`);
  if (cachedSeries) {
    try {
      const parsed = JSON.parse(cachedSeries);
      const cacheAge = Date.now() - parsed.timestamp;
      
      // Se o cache for válido (menos de 24 horas)
      if (cacheAge < 24 * 60 * 60 * 1000) {
        if (debug) console.log(`Série encontrada no cache: ${parsed.series.name}`);
        return parsed.series;
      } else {
        if (debug) console.log('Cache expirado, buscando dados atualizados');
        localStorage.removeItem(`series-${normalizedSlug}`);
      }
    } catch (e) {
      console.error('Erro ao processar cache de série:', e);
      localStorage.removeItem(`series-${normalizedSlug}`);
    }
  }
  
  // Estratégia 1: Busca otimizada por nome similar
  try {
    if (debug) console.log('Estratégia 1: Busca por nome similar');
    const { data: seriesData, error: dbError } = await supabase
      .from('channels')
      .select('*')
      .eq('type', 'series')
      .ilike('name', `%${normalizedSlug.replace(/-/g, '%')}%`)
      .limit(50);
    
    if (dbError) {
      console.error('Erro ao buscar série por nome:', dbError);
    } else if (seriesData && seriesData.length > 0) {
      // Encontrar a melhor correspondência
      const series = findBestMatch(seriesData, normalizedSlug);
      if (series) {
        if (debug) console.log(`Série encontrada por nome similar: ${series.name}`);
        cacheSeriesData(normalizedSlug, series);
        return formatSeries(series);
      }
    }
  } catch (error) {
    console.error('Erro na estratégia 1:', error);
  }
  
  // Estratégia 2: Busca por grupo
  try {
    // Verificar se o slug contém informações de grupo
    const groupMatch = normalizedSlug.match(/(.+?)-(.+)/);
    if (groupMatch && groupMatch.length >= 3) {
      const possibleGroup = groupMatch[1].replace(/-/g, ' ');
      const seriesName = groupMatch[2].replace(/-/g, ' ');
      
      if (debug) console.log(`Estratégia 2: Busca por grupo "${possibleGroup}" e nome "${seriesName}"`);
      
      const { data: groupSeriesData, error: groupError } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'series')
        .ilike('group_title', `%${possibleGroup}%`)
        .limit(100);
      
      if (groupError) {
        console.error('Erro ao buscar série por grupo:', groupError);
      } else if (groupSeriesData && groupSeriesData.length > 0) {
        // Buscar a melhor correspondência dentro do grupo
        const series = findBestMatch(groupSeriesData, seriesName);
        if (series) {
          if (debug) console.log(`Série encontrada por grupo: ${series.name}`);
          cacheSeriesData(normalizedSlug, series);
          return formatSeries(series);
        }
      }
    }
  } catch (error) {
    console.error('Erro na estratégia 2:', error);
  }
  
  // Estratégia 3: Busca paginada completa
  try {
    if (debug) console.log('Estratégia 3: Busca paginada completa');
    
    // Limitar a busca a 10 páginas (10.000 séries) para evitar sobrecarga
    const maxPages = 10;
    const pageSize = 1000;
    
    for (let page = 0; page < maxPages; page++) {
      if (debug) console.log(`Buscando página ${page + 1} de ${maxPages}`);
      
      const { data: allSeriesData, error: allSeriesError } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'series')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (allSeriesError) {
        console.error(`Erro ao buscar página ${page + 1}:`, allSeriesError);
        continue;
      }
      
      if (!allSeriesData || allSeriesData.length === 0) {
        if (debug) console.log(`Nenhuma série encontrada na página ${page + 1}`);
        break; // Não há mais dados para buscar
      }
      
      // Buscar a melhor correspondência
      const series = findBestMatch(allSeriesData, normalizedSlug);
      if (series) {
        if (debug) console.log(`Série encontrada na página ${page + 1}: ${series.name}`);
        cacheSeriesData(normalizedSlug, series);
        return formatSeries(series);
      }
      
      // Se chegamos à última página ou não há mais dados, parar a busca
      if (allSeriesData.length < pageSize) {
        if (debug) console.log('Fim dos dados, parando busca');
        break;
      }
    }
  } catch (error) {
    console.error('Erro na estratégia 3:', error);
  }
  
  console.error(`Série não encontrada para o slug: ${normalizedSlug}`);
  return null;
};

/**
 * Encontra a melhor correspondência para o slug em um array de séries
 */
function findBestMatch(seriesArray: any[], slug: string): any | null {
  if (!seriesArray || seriesArray.length === 0) return null;
  
  const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ').trim();
  
  // Primeiro, tentar encontrar uma correspondência exata
  const exactMatch = seriesArray.find(s => 
    s.name.toLowerCase() === normalizedSlug ||
    s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSlug.replace(/[^a-z0-9]/g, '')
  );
  
  if (exactMatch) return exactMatch;
  
  // Se não houver correspondência exata, encontrar a melhor correspondência parcial
  let bestMatch = null;
  let highestScore = 0;
  
  for (const series of seriesArray) {
    const seriesName = series.name.toLowerCase();
    
    // Calcular pontuação de similaridade
    let score = 0;
    
    // Verificar se o slug está contido no nome da série
    if (seriesName.includes(normalizedSlug)) {
      score += 5;
    }
    
    // Verificar palavras em comum
    const slugWords = normalizedSlug.split(' ');
    const nameWords = seriesName.split(' ');
    
    for (const word of slugWords) {
      if (word.length > 2 && nameWords.includes(word)) {
        score += 2;
      }
    }
    
    // Verificar se as iniciais correspondem
    const slugInitials = slugWords.map((w: string) => w[0]).join('');
    const nameInitials = nameWords.map((w: string) => w[0]).join('');
    
    if (slugInitials === nameInitials) {
      score += 3;
    }
    
    // Atualizar a melhor correspondência se esta tiver pontuação mais alta
    if (score > highestScore) {
      highestScore = score;
      bestMatch = series;
    }
  }
  
  // Retornar a melhor correspondência se tiver uma pontuação mínima
  return highestScore >= 2 ? bestMatch : null;
}

/**
 * Formata os dados da série para o formato esperado pela aplicação
 */
function formatSeries(series: any): Channel {
  return {
    ...series,
    id: series.id || `${series.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    logo: series.logo || null,
    group_title: series.group_title || 'Sem Categoria',
    type: 'series'
  };
}

/**
 * Armazena os dados da série em cache para acesso rápido futuro
 */
function cacheSeriesData(slug: string, series: any): void {
  try {
    localStorage.setItem(`series-${slug}`, JSON.stringify({
      series: formatSeries(series),
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Erro ao salvar série em cache:', e);
  }
}

// Carrega episódios de uma série
export async function loadEpisodes(seriesName: string) {
  try {
    console.log(`Carregando episódios para: ${seriesName}`);
    
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
