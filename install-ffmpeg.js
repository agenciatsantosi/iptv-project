import { exec } from 'child_process';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import https from 'https';

const execAsync = promisify(exec);
const pipelineAsync = promisify(pipeline);

async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    console.log('FFmpeg já está instalado!');
    return true;
  } catch (error) {
    console.log('FFmpeg não encontrado, iniciando instalação...');
    return false;
  }
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', error => {
      reject(error);
    });
  });
}

async function installFFmpeg() {
  try {
    const isInstalled = await checkFFmpeg();
    if (isInstalled) return;

    console.log('Baixando FFmpeg...');
    
    // URL do FFmpeg para Windows (você pode atualizar para a versão mais recente)
    const ffmpegUrl = 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip';
    const zipPath = './ffmpeg.zip';
    
    await downloadFile(ffmpegUrl, zipPath);
    console.log('Download concluído!');

    console.log('Extraindo FFmpeg...');
    await execAsync(`powershell Expand-Archive -Path ${zipPath} -DestinationPath ./ffmpeg -Force`);
    
    console.log('Movendo FFmpeg para o PATH...');
    const ffmpegBinPath = './ffmpeg/ffmpeg-master-latest-win64-gpl/bin';
    
    // Adiciona o diretório do FFmpeg ao PATH do sistema
    const path = process.env.PATH || '';
    process.env.PATH = `${ffmpegBinPath};${path}`;
    
    console.log('FFmpeg instalado com sucesso!');
    
    // Limpa os arquivos temporários
    await execAsync('del ffmpeg.zip');
    
  } catch (error) {
    console.error('Erro ao instalar FFmpeg:', error);
    throw error;
  }
}

installFFmpeg().catch(console.error);
