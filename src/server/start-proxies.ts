import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definição explícita das portas
const VOD_PORT = 3002;   // Porta para vídeos sob demanda (filmes e séries)
const LIVE_PORT = 3001;  // Porta para TV ao vivo

// Inicia os servidores proxy
function startProxies() {
  console.log('Iniciando servidores proxy...');
  
  // Iniciar VOD Proxy (porta 3002 - filmes e séries)
  const vodProxy = spawn('node', ['--loader', 'tsx', join(__dirname, 'vod-proxy.ts')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PROXY_PORT: VOD_PORT.toString()
    }
  });

  // Iniciar Live TV Proxy (porta 3001 - TV ao vivo)
  const liveProxy = spawn('node', ['--loader', 'tsx', join(__dirname, 'live-proxy.ts')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      LIVE_PROXY_PORT: LIVE_PORT.toString()
    }
  });

  // Iniciar Playlist Proxy (se existir)
  const playlistProxy = spawn('node', ['--loader', 'tsx', join(__dirname, 'playlist-proxy.ts')], {
    stdio: 'inherit'
  });

  // Gerencia o processo VOD
  vodProxy.on('error', (error) => {
    console.error('Erro no servidor VOD (Filmes e Séries):', error);
  });

  vodProxy.on('exit', (code) => {
    console.log(`Servidor VOD (Filmes e Séries) finalizado com código: ${code}`);
  });

  // Gerencia o processo Live
  liveProxy.on('error', (error) => {
    console.error('Erro no servidor Live (TV ao vivo):', error);
  });

  liveProxy.on('exit', (code) => {
    console.log(`Servidor Live (TV ao vivo) finalizado com código: ${code}`);
  });

  // Gerencia o processo Playlist
  playlistProxy.on('error', (error) => {
    console.error('Erro no servidor Playlist:', error);
  });

  playlistProxy.on('exit', (code) => {
    console.log(`Servidor Playlist finalizado com código: ${code}`);
  });

  // Gerencia encerramento gracioso
  process.on('SIGINT', () => {
    console.log('Encerrando servidores proxy...');
    vodProxy.kill();
    liveProxy.kill();
    playlistProxy.kill();
    process.exit();
  });

  // Registrar informações sobre os servidores
  console.log('=== Servidores Proxy Iniciados ===');
  console.log(`Live TV Proxy: http://localhost:${LIVE_PORT} (TV ao vivo)`);
  console.log(`VOD Proxy: http://localhost:${VOD_PORT} (Filmes e Séries)`);
  console.log('=================================');
}

startProxies();
