import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicia os servidores proxy
function startProxies() {
  const mainProxy = spawn('node', [join(__dirname, '../../proxy.js')], {
    stdio: 'inherit'
  });

  const vodProxy = spawn('node', [join(__dirname, 'vod-proxy.js')], {
    stdio: 'inherit'
  });

  const liveProxy = spawn('node', [join(__dirname, 'live-proxy.js')], {
    stdio: 'inherit'
  });

  const playlistProxy = spawn('node', [join(__dirname, 'playlist-proxy.js')], {
    stdio: 'inherit'
  });

  // Gerencia o processo principal
  mainProxy.on('error', (error) => {
    console.error('Erro no servidor principal:', error);
  });

  mainProxy.on('exit', (code) => {
    console.log(`Servidor principal finalizado com código: ${code}`);
  });

  // Gerencia o processo VOD
  vodProxy.on('error', (error) => {
    console.error('Erro no servidor VOD:', error);
  });

  vodProxy.on('exit', (code) => {
    console.log(`Servidor VOD finalizado com código: ${code}`);
  });

  // Gerencia o processo Live
  liveProxy.on('error', (error) => {
    console.error('Erro no servidor Live:', error);
  });

  liveProxy.on('exit', (code) => {
    console.log(`Servidor Live finalizado com código: ${code}`);
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
    mainProxy.kill();
    vodProxy.kill();
    liveProxy.kill();
    playlistProxy.kill();
    process.exit();
  });
}

startProxies();
