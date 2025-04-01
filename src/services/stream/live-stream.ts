import { BaseStreamService } from './base-stream';

export class LiveStreamService extends BaseStreamService {
  private readonly LIVE_PROXY_PORT = 3002;

  protected getProxyServerUrl(): string {
    return `http://localhost:${this.LIVE_PROXY_PORT}`;
  }

  async processStreamUrl(url: string): Promise<string> {
    // Verifica disponibilidade
    const isAvailable = await this.checkStreamAvailability(url);
    if (!isAvailable) {
      throw new Error('Stream não disponível');
    }

    // Retorna URL do proxy para live streaming
    return this.getProxyUrl(url);
  }
}
