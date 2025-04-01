import axios from 'axios';

export abstract class BaseStreamService {
  protected readonly CHUNK_SIZE = 1024 * 1024; // 1MB
  protected readonly DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': '*/*',
    'Range': 'bytes=0-'
  };

  protected async checkStreamAvailability(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, {
        headers: this.DEFAULT_HEADERS,
        timeout: 5000
      });
      return response.status === 200 || response.status === 206;
    } catch {
      return false;
    }
  }

  protected getProxyUrl(url: string): string {
    return `${this.getProxyServerUrl()}/stream?url=${encodeURIComponent(url)}`;
  }

  protected abstract getProxyServerUrl(): string;
  
  abstract processStreamUrl(url: string): Promise<string>;
}
