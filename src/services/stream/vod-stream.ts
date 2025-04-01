import { BaseStreamService } from './base-stream';

export class VODStreamService extends BaseStreamService {
  private readonly VOD_PROXY_PORT = 3001;

  protected getProxyServerUrl(): string {
    return `http://localhost:${this.VOD_PROXY_PORT}`;
  }

  async processStreamUrl(url: string): Promise<string> {
    // Verifica disponibilidade
    const isAvailable = await this.checkStreamAvailability(url);
    if (!isAvailable) {
      throw new Error('Stream não disponível');
    }

    // Retorna URL do proxy para VOD
    return this.getProxyUrl(url);
  }
}
