interface ProxyConfig {
  username: string;
  password: string;
}

class ProxyService {
  private static instance: ProxyService;
  private proxyConfig: ProxyConfig | null = null;
  private readonly STREAMING_SERVERS = [
    'http://195.154.184.228:25461',
    'http://209.126.105.138:25461',
    'http://onefr.xplatrd.com:8080'
  ];

  private constructor() {}

  static getInstance(): ProxyService {
    if (!ProxyService.instance) {
      ProxyService.instance = new ProxyService();
    }
    return ProxyService.instance;
  }

  setConfig(config: ProxyConfig) {
    this.proxyConfig = config;
  }

  private extractTokenFromUrl(url: string): string | null {
    const tokenMatch = url.match(/[?&]token=([^&]+)/);
    return tokenMatch ? tokenMatch[1] : null;
  }

  private extractStreamInfo(url: string): { streamId: string; type: string } | null {
    // Extrai o ID do stream e tipo da URL
    const streamMatch = url.match(/\/(\d+)\.(mp4|m3u8)/);
    if (!streamMatch) return null;

    return {
      streamId: streamMatch[1],
      type: streamMatch[2] === 'm3u8' ? 'live' : 'movie'
    };
  }

  private async findWorkingServer(streamInfo: { streamId: string; type: string }): Promise<string | null> {
    for (const server of this.STREAMING_SERVERS) {
      try {
        const url = new URL('/streaming/clients_movie.php', server);
        const params = new URLSearchParams({
          username: this.proxyConfig?.username || '',
          password: this.proxyConfig?.password || '',
          stream: `${streamInfo.streamId}.${streamInfo.type === 'live' ? 'm3u8' : 'mp4'}`,
          type: streamInfo.type
        });

        const response = await fetch(`${url}?${params}`, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (response.ok) {
          return server;
        }
      } catch (error) {
        console.warn(`Servidor ${server} não respondeu:`, error);
        continue;
      }
    }
    return null;
  }

  async getProxiedUrl(originalUrl: string): Promise<string> {
    if (!this.proxyConfig) {
      console.error('Proxy config não definido');
      return originalUrl;
    }

    try {
      const streamInfo = this.extractStreamInfo(originalUrl);
      if (!streamInfo) {
        console.error('Não foi possível extrair informações do stream');
        return originalUrl;
      }

      // Encontra um servidor que funcione
      const workingServer = await this.findWorkingServer(streamInfo);
      if (!workingServer) {
        console.error('Nenhum servidor disponível');
        return originalUrl;
      }

      // Constrói a URL do streaming
      const streamingUrl = new URL('/streaming/clients_movie.php', workingServer);
      
      // Adiciona os parâmetros necessários
      const params = new URLSearchParams({
        username: this.proxyConfig.username,
        password: this.proxyConfig.password,
        stream: `${streamInfo.streamId}.${streamInfo.type === 'live' ? 'm3u8' : 'mp4'}`,
        type: streamInfo.type
      });

      // Tenta obter o token da URL original ou gerar um novo
      const token = this.extractTokenFromUrl(originalUrl);
      if (token) {
        params.append('token', token);
      }

      // Retorna a URL completa
      return `${streamingUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Erro ao gerar URL proxy:', error);
      return originalUrl;
    }
  }
}

export const proxyService = ProxyService.getInstance();
