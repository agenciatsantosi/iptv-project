import { useState } from 'react';
import { Channel, determineContentType, extractContentInfo } from '../types/iptv';
import { v4 as uuidv4 } from 'uuid';

interface ExtinfAttributes {
  'tvg-id'?: string;
  'tvg-name'?: string;
  'tvg-logo'?: string;
  'group-title'?: string;
  'group-name'?: string;
  'description'?: string;
  'duration'?: string;
  'rating'?: string;
  'country'?: string;
  'language'?: string;
  'director'?: string;
  'cast'?: string;
}

function parseExtinfLine(line: string): { attributes: ExtinfAttributes; name: string } {
  const attributes: ExtinfAttributes = {};
  
  // Primeiro, separa a linha em duas partes: atributos e nome
  const [attrPart, namePart] = line.split(/,(.+)/);
  
  // Processa os atributos
  const attrStr = attrPart.replace('#EXTINF:-1 ', '');
  let currentKey = '';
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < attrStr.length; i++) {
    const char = attrStr[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      if (!inQuotes && currentKey) {
        attributes[currentKey as keyof ExtinfAttributes] = currentValue;
        currentKey = '';
        currentValue = '';
      }
    } else if (char === '=' && !inQuotes) {
      // Próximo caractere deve ser uma aspas
      continue;
    } else if (/\s/.test(char) && !inQuotes) {
      if (currentKey && currentValue) {
        attributes[currentKey as keyof ExtinfAttributes] = currentValue;
        currentKey = '';
        currentValue = '';
      }
    } else if (!inQuotes && /[a-zA-Z-]/.test(char)) {
      currentKey += char;
    } else if (inQuotes) {
      currentValue += char;
    }
  }

  console.log('Atributos extraídos:', { line, attributes });
  
  return {
    attributes,
    name: namePart ? namePart.trim() : ''
  };
}

export function useIPTVPlaylist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseContent = (extinf: { attributes: ExtinfAttributes; name: string }, url: string): Channel => {
    const now = new Date().toISOString();
    
    // Processa o group-title
    const rawGroupTitle = extinf.attributes['group-title'];
    const groupTitle = rawGroupTitle 
      ? rawGroupTitle.replace(/^CANAIS:\s*/i, '').trim() // Remove o prefixo "CANAIS:"
      : 'Sem Categoria';

    // Extrair o group do group-title
    const groupMatch = groupTitle.match(/^Series\s*\|\s*(.+)$/i);
    const group = groupMatch ? groupMatch[1].trim() : groupTitle;

    // Extrair informações de temporada/episódio
    let baseName = extinf.name;
    let seasonNumber: number | undefined = undefined;
    let episodeNumber: number | undefined = undefined;

    const patterns = [
      /^(.*?)\s+[Ss](\d{1,2})\s*[Ee](\d{1,2})/i,  // Formato: Nome S01E01
      /^(.*?)\s+[Ss](\d{1,2})/i,                   // Formato: Nome S01
      /^(.*?)\s+[Tt]emporada\s*(\d{1,2})/i,        // Formato: Nome Temporada 1
      /^(.*?)\s+[Ee]pisodio\s*(\d{1,2})/i          // Formato: Nome Episodio 1
    ];

    for (const pattern of patterns) {
      const match = extinf.name.match(pattern);
      if (match) {
        baseName = match[1].trim();
        if (match[2]) {
          seasonNumber = parseInt(match[2]);
        }
        if (match[3]) {
          episodeNumber = parseInt(match[3]);
        }
        break;
      }
    }

    // Determinar o tipo de conteúdo
    const type = determineContentType(groupTitle, extinf.name);

    // Criar o objeto Channel com todos os campos necessários
    return {
      id: uuidv4(),
      name: baseName,
      url: url,
      logo: extinf.attributes['tvg-logo'] || null,
      group: group,
      group_title: groupTitle,
      type: type,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      full_name: extinf.name,
      created_at: now,
      updated_at: now,
      tvg: {
        id: extinf.attributes['tvg-id'],
        name: extinf.attributes['tvg-name'],
        logo: extinf.attributes['tvg-logo']
      }
    };
  };

  const importPlaylist = async (input: string | File, onProgress?: (progress: { stage: string; progress: number }) => void) => {
    try {
      setLoading(true);
      setError(null);

      let content: string;
      
      if (typeof input === 'string') {
        if (input.startsWith('http')) {
          onProgress?.({ stage: 'downloading', progress: 0 });
          const response = await fetch(input);
          content = await response.text();
          onProgress?.({ stage: 'downloading', progress: 100 });
        } else {
          content = input;
        }
      } else {
        content = await input.text();
      }

      onProgress?.({ stage: 'parsing', progress: 0 });

      const lines = content.split(/\r?\n/);
      const totalLines = lines.length;
      let currentLine = 0;

      const channels: Channel[] = [];
      let currentExtinf: { attributes: ExtinfAttributes; name: string } | null = null;

      for (const line of lines) {
        currentLine++;
        onProgress?.({ stage: 'parsing', progress: (currentLine / totalLines) * 100 });

        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#EXTM3U')) continue;

        if (trimmedLine.startsWith('#EXTINF:')) {
          currentExtinf = parseExtinfLine(trimmedLine);
        } else if (trimmedLine.startsWith('http') && currentExtinf) {
          const channel = parseContent(currentExtinf, trimmedLine);
          channels.push(channel);
          currentExtinf = null;
        }
      }

      onProgress?.({ stage: 'processing', progress: 100 });

      console.log('Resultado do processamento:', {
        totalLinhas: lines.length,
        canaisProcessados: channels.length,
        primeiroCanal: channels[0],
        ultimoCanal: channels[channels.length - 1]
      });

      return channels;

    } catch (err) {
      console.error('Erro ao processar playlist:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { importPlaylist, loading, error };
}