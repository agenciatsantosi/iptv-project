import axios from 'axios';

export class ProxyService {
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB por chunk
  private readonly PROXY_URL = 'https://api.allorigins.win/raw?url=';

  async fetchWithProxy(url: string): Promise<string> {
    try {
      const response = await axios.get(`${this.PROXY_URL}${encodeURIComponent(url)}`, {
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar conteúdo via proxy:', error);
      throw new Error('Falha ao acessar a URL via proxy');
    }
  }

  async fetchInChunks(url: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const totalSize = parseInt(response.headers['content-length'] || '0');
      let receivedSize = 0;
      let chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
          receivedSize += chunk.length;

          if (totalSize && onProgress) {
            const progress = (receivedSize / totalSize) * 100;
            onProgress(progress);
          }
        });

        response.data.on('end', () => {
          const content = Buffer.concat(chunks).toString('utf-8');
          resolve(content);
        });

        response.data.on('error', (error: Error) => {
          console.error('Erro durante o download:', error);
          reject(new Error('Falha durante o download do arquivo'));
        });
      });
    } catch (error) {
      console.error('Erro ao baixar em chunks:', error);
      // Se falhar, tenta via proxy
      return this.fetchWithProxy(url);
    }
  }

  // Função para verificar se uma URL é válida
  async validateUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url);
      return response.status === 200;
    } catch {
      try {
        // Se falhar, tenta via proxy
        await this.fetchWithProxy(url);
        return true;
      } catch {
        return false;
      }
    }
  }
}
