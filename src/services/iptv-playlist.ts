import m3u8Parser from 'iptv-playlist-parser';
import { Channel } from '../types/channel';
import { PlaylistDownloadService } from './playlist-download';

export class IPTVPlaylistService {
  private playlistDownloader: PlaylistDownloadService;

  constructor() {
    this.playlistDownloader = new PlaylistDownloadService();
  }

  async importPlaylist(content: string): Promise<Channel[]> {
    try {
      let playlistContent: string;

      // Se o content for uma URL, baixa o conteúdo
      if (this.isUrl(content)) {
        console.log('Baixando playlist da URL:', content);
        
        playlistContent = await this.playlistDownloader.downloadPlaylist(content, 
          (progress) => {
            console.log(`Download progresso: ${progress.toFixed(1)}%`);
          }
        );
        
        console.log('Download concluído, tamanho:', playlistContent.length);
      } else {
        playlistContent = content;
      }

      // Parse da playlist
      console.log('Iniciando parse da playlist...');
      const playlist = m3u8Parser.parse(playlistContent);

      if (!playlist.items || playlist.items.length === 0) {
        throw new Error('Nenhum canal encontrado na playlist');
      }

      console.log(`Encontrados ${playlist.items.length} itens na playlist`);

      // Mapeia os itens para o formato de Channel
      return playlist.items
        .filter(item => item.url && item.name) // Filtra itens inválidos
        .map((item, index) => ({
          id: `${index}_${Date.now()}`,
          name: item.name || `Canal ${index + 1}`,
          url: item.url,
          group: item.group?.title || 'Sem Categoria',
          logo: item.tvg?.logo || '',
          cast: [],
          description: item.group?.title || '',
          duration: '',
          rating: '',
          releaseDate: '',
          genre: item.group?.title || '',
          director: '',
          views: 0,
          type: this.determineType(item)
        }));
    } catch (error) {
      console.error('Error importing playlist:', error);
      throw error;
    }
  }

  private isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  private determineType(item: any): 'movie' | 'series' | 'live' {
    const group = (item.group?.title || '').toLowerCase();
    const name = (item.name || '').toLowerCase();

    if (group.includes('filme') || name.includes('filme')) {
      return 'movie';
    } else if (group.includes('serie') || name.includes('serie')) {
      return 'series';
    } else {
      return 'live';
    }
  }
}