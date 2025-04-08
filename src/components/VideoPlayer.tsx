import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  onError?: (error: any) => void;
}

// URLs de teste públicas para facilitar o diagnóstico
const TEST_STREAMS = [
  {
    name: 'Big Buck Bunny',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  },
  {
    name: 'Test Pattern',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
  },
  {
    name: 'Tears of Steel',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
  }
];

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  poster,
  autoPlay = true,
  controls = true,
  muted = false,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(true); // Assume streams are live by default
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  // Função simples para converter uma URL direct em stream
  const getStreamUrl = (inputUrl: string) => {
    if (inputUrl.includes('/direct?')) {
      return inputUrl.replace('/direct?', '/stream?');
    }
    return inputUrl;
  };

  const tryTestStream = async (testUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir URL para o proxy
      const proxyUrl = `http://localhost:3001/stream?url=${encodeURIComponent(testUrl)}`;
      console.log('Tentando stream de teste:', proxyUrl);
      
      // Limpar player atual
      cleanupPlayer();
      
      loadVideo(proxyUrl);
    } catch (err) {
      console.error('Erro ao tentar stream de teste:', err);
      setError('Erro ao tentar stream de teste');
      setLoading(false);
    }
  };

  // Função para liberar o stream no servidor
  const releaseStream = async (streamId: string) => {
    try {
      console.log(`Liberando stream: ${streamId}`);
      await fetch(`http://localhost:3001/release/${streamId}`);
    } catch (err) {
      console.error('Erro ao liberar stream:', err);
    }
  };

  // Função para limpar o player atual
  const cleanupPlayer = () => {
    // Liberar o stream atual se existir
    if (currentStreamId) {
      releaseStream(currentStreamId);
      setCurrentStreamId(null);
    }
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (videoRef.current) {
      // Garantir que o vídeo pare completamente
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
  };

  // Função principal para carregar o vídeo
  const loadVideo = async (streamUrl: string) => {
    if (!videoRef.current) return;
    
    // Limpar player atual antes de iniciar um novo
    cleanupPlayer();
    
    const video = videoRef.current;
    
    try {
      // Solicita stream ao proxy
      console.log('URL para stream:', streamUrl);
      
      const response = await fetch(streamUrl);
      
      if (!response.ok) {
        throw new Error(`Erro ao solicitar stream: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta do proxy:', data);
      
      // Salvar o ID do stream atual
      if (data.streamId) {
        setCurrentStreamId(data.streamId);
      }
      
      // Constrói URL para o HLS
      const hlsUrl = new URL(data.url, 'http://localhost:3001').toString();
      console.log('URL final do HLS:', hlsUrl);
      
      // Verifica suporte a HLS
      if (Hls.isSupported()) {
        console.log('HLS suportado, inicializando...');
        
        const hls = new Hls({
          debug: true,
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          // Configurações para melhorar compatibilidade com AAC
          backBufferLength: 30,  // Aumenta buffer traseiro
          enableSoftwareAES: true, // Ajuda com algumas codificações
          startLevel: -1, // Nível automático
          // Aumenta tolerância a erros
          fragLoadingMaxRetry: 5,
          manifestLoadingMaxRetry: 5,
          levelLoadingMaxRetry: 5
        });
        
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('Manifest HLS carregado, tentando reproduzir');
          setLoading(false);
          if (autoPlay) {
            video.play().catch(err => {
              console.error('Erro ao iniciar reprodução:', err);
            });
          }
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.log('Erro HLS:', data);
          
          // Se for erro de parsing de AAC mas não for fatal, tenta continuar
          if (data.details === 'fragParsingError' && 
              data.error && 
              data.error.message && 
              data.error.message.includes('AAC PES') &&
              !data.fatal) {
            console.log('Erro de parsing AAC não fatal, continuando...');
            return;
          }
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Erro de rede, tentando recuperar...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Erro de mídia, tentando recuperar...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Erro fatal:', data);
                setError(`Erro no player: ${data.details}`);
                onError?.(data);
                break;
            }
          }
        });
        
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Suporte nativo (Safari)
        console.log('Usando suporte nativo a HLS');
        video.src = hlsUrl;
        setLoading(false);
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) video.play().catch(console.error);
        });
      } else {
        throw new Error('HLS não é suportado neste navegador');
      }
    } catch (error) {
      console.error('Erro ao inicializar player:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setLoading(false);
      onError?.(error);
    }
  };

  // Efeito para inicializar o player
  useEffect(() => {
    console.log('Inicializando player simples com URL:', url);
    
    // Limpar estado
    setLoading(true);
    setError(null);
    
    // Converter URL se necessário e iniciar carregamento
    const streamUrl = getStreamUrl(url);
    loadVideo(streamUrl);
    
    // Cleanup quando o componente for desmontado
    return () => {
      cleanupPlayer();
    };
  }, [url, autoPlay, onError]);

  // Registrar o evento beforeunload para garantir que o stream seja liberado
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentStreamId) {
        // Aqui usamos fetch síncrono pois é um evento beforeunload
        navigator.sendBeacon(`http://localhost:3001/release/${currentStreamId}`);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStreamId]);

  return (
    <div className="relative w-full h-full bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10 p-4">
          <p className="text-xl font-semibold mb-4">Erro ao reproduzir o vídeo</p>
          <p className="text-sm mb-8 max-w-md text-center text-gray-300">{error}</p>
          
          <button 
            onClick={() => setDiagnosticMode(prev => !prev)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mb-2"
          >
            {diagnosticMode ? 'Ocultar opções de diagnóstico' : 'Mostrar opções de diagnóstico'}
          </button>
          
          {diagnosticMode && (
            <div className="bg-gray-800 p-4 rounded-lg mt-4 w-full max-w-md">
              <p className="text-sm text-center mb-4">Teste com estas streams públicas:</p>
              
              <div className="flex flex-col gap-2">
                {TEST_STREAMS.map((stream, index) => (
                  <button 
                    key={index}
                    onClick={() => tryTestStream(stream.url)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    {stream.name}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 text-xs text-gray-400">
                <p>Problemas comuns:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>DNS: verificar configuração de DNS no sistema</li>
                  <li>Proxy: confirmar que o servidor proxy está rodando</li>
                  <li>Firewall: verificar se as portas 3001 e 80/443 estão abertas</li>
                  <li>URL do stream: confirmar se a URL original é acessível</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isLiveStream && !loading && !error && (
        <div className="absolute top-4 right-4 z-10 bg-black/70 rounded px-2 py-1 flex items-center">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse mr-1.5"></span>
          <span className="text-white text-sm font-semibold">ONLINE</span>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        controls={controls}
        muted={muted}
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default VideoPlayer; 