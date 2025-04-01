import axios from 'axios';

export class PlaylistDownloadService {
  private readonly PROXY_URL = 'http://localhost:3003/fetch';
  private readonly DEFAULT_TIMEOUT = 30000; // 30 segundos

  async downloadPlaylist(url: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      console.log('Baixando playlist via proxy:', url);
      
      const response = await axios.get(`${this.PROXY_URL}?url=${encodeURIComponent(url)}`, {
        timeout: this.DEFAULT_TIMEOUT,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress?.(progress);
          }
        }
      });

      if (response.status !== 200) {
        throw new Error(response.data?.error || 'Erro ao baixar playlist');
      }

      const content = response.data;
      
      // Valida o conteúdo
      if (typeof content !== 'string') {
        throw new Error('Resposta inválida do servidor');
      }

      if (!content.trim().startsWith('#EXTM3U')) {
        throw new Error('Arquivo inválido: Não é uma lista M3U/M3U8 válida');
      }

      console.log('Playlist baixada com sucesso, tamanho:', content.length);
      return content;

    } catch (error: any) {
      console.error('Erro ao baixar playlist:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Erro ao baixar playlist'
      );
    }
  }
}
