import { spawn } from 'child_process';
import { join } from 'path';

// Inicia os servidores proxy
function startProxies() {
  const vodProxy = spawn('node', [join(__dirname, 'vod-proxy.ts')], {
    stdio: 'inherit'
  });

  const liveProxy = spawn('node', [join(__dirname, 'live-proxy.ts')], {
    stdio: 'inherit'
  });

  const playlistProxy = spawn('node', [join(__dirname, 'playlist-proxy.ts')], {
    stdio: 'inherit'
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
    vodProxy.kill();
    liveProxy.kill();
    playlistProxy.kill();
    process.exit();
  });
}

startProxies();
