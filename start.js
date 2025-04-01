import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para iniciar um processo
function startProcess(command, args, name) {
  const process = spawn(command, args, {
    stdio: 'pipe',
    shell: true
  });

  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`[${name}] ${data}`);
  });

  process.on('close', (code) => {
    console.log(`[${name}] processo finalizado com código ${code}`);
  });

  return process;
}

// Inicia o proxy
console.log('Iniciando servidor proxy...');
const proxy = startProcess('node', ['proxy.js'], 'PROXY');

// Inicia o Vite
console.log('Iniciando servidor Vite...');
const vite = startProcess('npm', ['run', 'dev'], 'VITE');

// Gerenciamento de encerramento
process.on('SIGINT', () => {
  console.log('Encerrando processos...');
  proxy.kill();
  vite.kill();
  process.exit();
});
