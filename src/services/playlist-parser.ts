import { Channel } from '../types/iptv';

export class PlaylistParser {
  static parse(content: string): Channel[] {
    const lines = content.split('\n');
    const channels: Channel[] = [];
    let currentChannel: Partial<Channel> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Linha de informação do canal
      if (line.startsWith('#EXTINF:')) {
        currentChannel = this.parseChannelInfo(line);
      }
      // URL do canal
      else if (line && line.startsWith('http') && currentChannel) {
        currentChannel.url = line;
        currentChannel.id = this.generateId(line);
        channels.push(currentChannel as Channel);
        currentChannel = null;
      }
    }

    return channels;
  }

  private static parseChannelInfo(line: string): Partial<Channel> {
    const channel: Partial<Channel> = {};

    // Extrair duração
    const durationMatch = line.match(/^#EXTINF:([-]?\d+)/);
    if (durationMatch) {
      channel.duration = durationMatch[1];
    }

    // Extrair atributos
    const attributes = this.parseAttributes(line);
    
    // Nome do canal (último item após a última vírgula)
    const nameMatch = line.match(/,([^,]+)$/);
    if (nameMatch) {
      channel.name = nameMatch[1].trim();
    }

    // Grupo
    if (attributes['group-title']) {
      channel.group = attributes['group-title'];
    }

    // Logo
    if (attributes['tvg-logo']) {
      channel.logo = attributes['tvg-logo'];
    } else if (attributes['logo']) {
      channel.logo = attributes['logo'];
    }

    // Thumbnail
    if (attributes['tvg-logo']) {
      channel.thumbnailPath = attributes['tvg-logo'];
    } else if (attributes['logo']) {
      channel.thumbnailPath = attributes['logo'];
    } else if (attributes['tvg-thumbnail']) {
      channel.thumbnailPath = attributes['tvg-thumbnail'];
    }

    return channel;
  }

  private static parseAttributes(line: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const regex = /([a-zA-Z-]+)="([^"]*)"/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  private static generateId(url: string): string {
    // Gera um ID único baseado na URL
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }
}
