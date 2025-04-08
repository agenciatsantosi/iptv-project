import React, { useState, useRef, useEffect } from 'react';
import { useIPTVPlaylist } from '../hooks/useIPTVPlaylist';
import { useIPTVStore } from '../store/iptvStore';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { AuthProtection } from '../components/auth/AuthProtection';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/Dialog';

// Tamanho máximo de arquivo: 200MB
const MAX_FILE_SIZE = 200 * 1024 * 1024;

interface ImportProgress {
  stage: 'downloading' | 'parsing' | 'processing';
  progress: number;
  detail?: string;
}

interface PendingImport {
  content: string;
  source: string;
}

export function LargeFileUploadPage() {
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const { importPlaylist, error } = useIPTVPlaylist();
  const { addChannels, clearAll } = useIPTVStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Limpar recursos ao montar/desmontar o componente
  useEffect(() => {
    // Limpar ao montar
    setImportProgress(null);
    setIsProcessing(false);
    setFileError(null);
    setPendingImport(null);
    
    // Limpar ao desmontar
    return () => {
      if (fileInput.current) {
        fileInput.current.value = '';
      }
      setImportProgress(null);
      setIsProcessing(false);
      setFileError(null);
      setPendingImport(null);
    };
  }, []);

  // Função para lidar com erros críticos que podem travar a aplicação
  const handleCriticalError = (error: any) => {
    console.error('Erro crítico:', error);
    setIsProcessing(false);
    setImportProgress(null);
    setFileError('Ocorreu um erro crítico. Por favor, tente novamente ou contate o suporte.');
    
    toast({
      title: 'Erro crítico',
      description: 'A operação foi interrompida devido a um erro. Tente novamente mais tarde.',
      variant: 'destructive',
      duration: 5000
    });
    
    // Limpar recursos
    if (fileInput.current) {
      fileInput.current.value = '';
    }
    setPendingImport(null);
    setShowConfirmDialog(false);
    
    // Opcional: redirecionar para a página inicial após um erro crítico
    // setTimeout(() => navigate('/'), 3000);
  };

  const handleImport = async (content: string, source: string) => {
    try {
      console.log('Iniciando importação:', { source });
      setPendingImport({ content, source });
      setShowConfirmDialog(true);
      console.log('Diálogo de confirmação aberto');
    } catch (error) {
      handleImportError(error);
    }
  };

  const processImport = async (content: string, source: string, shouldClear: boolean = false) => {
    try {
      console.log('Iniciando processamento:', { source, shouldClear });
      setIsProcessing(true);
      setFileError(null);
      setImportProgress({ stage: 'parsing', progress: 50 });

      // Aumentar o tamanho do lote para arquivos grandes
      const BATCH_SIZE = 1000; // Reduzido para 1000 canais por vez para evitar problemas de memória
      let processedChannels = 0;

      // Adicionar timeout para permitir que a UI atualize
      await new Promise(resolve => setTimeout(resolve, 100));

      const channels = await importPlaylist(content, (progress) => {
        setImportProgress({
          stage: 'parsing',
          progress: 50 + Math.floor(progress.progress * 0.2), // 50% a 70% do progresso
          detail: progress.detail || 'Processando canais...'
        });
      });
      
      if (!channels || channels.length === 0) {
        throw new Error('Nenhum canal válido encontrado. Verifique se o formato está correto.');
      }

      console.log('Canais processados:', channels.length);
      
      // Limpar lista se necessário
      if (shouldClear) {
        setImportProgress({ stage: 'processing', progress: 70 });
        await clearAll();
      }

      // Adicionar canais em lotes menores com pausas entre eles
      const totalChannels = channels.length;
      for (let i = 0; i < totalChannels; i += BATCH_SIZE) {
        // Permitir que a UI responda entre os lotes
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const batch = channels.slice(i, i + BATCH_SIZE);
        await addChannels(batch, source);
        
        processedChannels += batch.length;
        const progress = 70 + Math.floor((processedChannels / totalChannels) * 30); // 70% a 100% do progresso
        setImportProgress({ 
          stage: 'processing', 
          progress,
          detail: `Processando canais ${processedChannels} de ${totalChannels}`
        });

        // Pausa maior para não travar a interface
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('Lista importada com sucesso:', { totalChannels: processedChannels });
      toast({
        title: shouldClear ? 'Lista substituída com sucesso!' : 'Canais adicionados com sucesso!',
        description: `${processedChannels} canais foram ${shouldClear ? 'importados' : 'adicionados'} com sucesso.`,
        variant: 'default',
        duration: 5000
      });
      
      if (fileInput.current) {
        fileInput.current.value = '';
      }
      
    } catch (error) {
      handleImportError(error);
    } finally {
      setIsProcessing(false);
      setImportProgress(null);
    }
  };

  const handleConfirmImport = async (shouldClear: boolean = true) => {
    if (!pendingImport) return;
    
    try {
      await processImport(pendingImport.content, pendingImport.source, shouldClear);
    } catch (error) {
      handleCriticalError(error);
    } finally {
      setShowConfirmDialog(false);
      setPendingImport(null);
    }
  };

  const handleCancelImport = () => {
    console.log('Importação cancelada');
    setPendingImport(null);
    setShowConfirmDialog(false);
    setImportProgress(null);
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const validateM3UFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Adicionar evento de progresso para arquivos grandes
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 25); // 25% do progresso total
          setImportProgress({ 
            stage: 'downloading', 
            progress,
            detail: `Lendo arquivo: ${(event.loaded / (1024 * 1024)).toFixed(2)}MB de ${(event.total / (1024 * 1024)).toFixed(2)}MB`
          });
        }
      };
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            reject(new Error('Erro ao ler o conteúdo do arquivo'));
            return;
          }

          console.log('Validando arquivo M3U:', {
            tamanho: file.size,
            primeirosBytes: content.slice(0, 100),
            temBOM: content.charCodeAt(0) === 0xFEFF
          });

          // Atualizar progresso
          setImportProgress({ stage: 'parsing', progress: 30 });

          // Verificar BOM e remover se necessário
          const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
          
          // Dividir em linhas e remover linhas vazias
          const lines = cleanContent.split(/\r?\n/).filter(line => line.trim());
          const firstLine = lines[0]?.trim();
          
          console.log('Primeira linha do arquivo:', {
            linha: firstLine,
            bytes: Array.from(firstLine || '').map(c => c.charCodeAt(0))
          });

          // Atualizar progresso
          setImportProgress({ stage: 'parsing', progress: 40 });

          // Se o arquivo começa com #EXTINF, vamos adicionar #EXTM3U
          let processedContent = cleanContent;
          if (firstLine?.startsWith('#EXTINF:')) {
            console.log('Arquivo não começa com #EXTM3U, adicionando cabeçalho...');
            processedContent = '#EXTM3U\n' + cleanContent;
          } else if (!firstLine?.includes('#EXTM3U')) {
            reject(new Error('O arquivo não parece ser uma lista M3U válida. Deve começar com #EXTM3U ou #EXTINF.'));
            return;
          }
          
          // Verificar se tem entradas EXTINF
          const hasExtInf = lines.some(line => line.trim().startsWith('#EXTINF:'));
          if (!hasExtInf) {
            reject(new Error('O arquivo não contém entradas de canais válidas (#EXTINF). Verifique se o arquivo está no formato correto.'));
            return;
          }

          // Verificar se tem URLs válidas
          const urls = lines.filter(line => 
            line.trim() && 
            !line.startsWith('#') && 
            (line.startsWith('http://') || line.startsWith('https://'))
          );

          if (urls.length === 0) {
            reject(new Error('O arquivo não contém URLs de canais válidas. Verifique se o arquivo está no formato correto.'));
            return;
          }

          // Atualizar progresso
          setImportProgress({ stage: 'parsing', progress: 50 });

          console.log('Validação do arquivo M3U:', {
            totalLinhas: lines.length,
            linhasExtInf: lines.filter(l => l.includes('#EXTINF:')).length,
            urlsEncontradas: urls.length,
            conteudoProcessado: processedContent.slice(0, 200) // Mostra o início do conteúdo processado
          });
          
          resolve(processedContent);
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          reject(new Error('Erro ao processar o arquivo. Verifique se o formato está correto.'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo: ' + reader.error?.message));
      
      // Adicionar um timeout para evitar travamentos em arquivos muito grandes
      setTimeout(() => {
        try {
          reader.readAsText(file);
        } catch (error) {
          reject(new Error('Erro ao iniciar a leitura do arquivo. O arquivo pode ser muito grande ou estar corrompido.'));
        }
      }, 100);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      console.log('Arquivo selecionado:', file.name);
      // Validações do arquivo
      if (!file.name.endsWith('.m3u') && !file.name.endsWith('.m3u8')) {
        throw new Error('Formato de arquivo inválido. Use apenas arquivos .m3u ou .m3u8');
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). Máximo permitido: 200MB`);
      }

      if (file.size === 0) {
        throw new Error('O arquivo está vazio');
      }

      // Mostrar progresso de leitura para arquivos grandes
      setImportProgress({ stage: 'downloading', progress: 0 });
      
      const content = await validateM3UFile(file);
      console.log('Arquivo validado, iniciando importação');
      await handleImport(content, file.name);

    } catch (error) {
      handleImportError(error);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
      setImportProgress(null);
    }
  };

  const handleImportError = (error: any) => {
    console.error('Erro na importação:', error);
    setFileError(error instanceof Error ? error.message : 'Erro desconhecido na importação');
    toast({
      title: 'Erro na importação',
      description: error instanceof Error ? error.message : 'Erro desconhecido na importação',
      variant: 'destructive',
      duration: 5000
    });
  };

  return (
    <AuthProtection>
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Upload de Arquivos Grandes</h1>
          </div>

          {/* Conteúdo Principal */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-zinc-800 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold">Importar Lista IPTV Grande</h2>
              </div>

              <div className="mb-6">
                <p className="text-zinc-400 mb-2">
                  Esta página permite o upload de arquivos M3U/M3U8 de até 200MB. 
                  Use esta opção para listas IPTV muito grandes que excedem o limite padrão.
                </p>
                <div className="bg-purple-900/30 border border-purple-700/50 rounded-md p-3 text-sm">
                  <p className="font-medium text-purple-300">
                    Dica: O processamento de arquivos grandes pode levar alguns minutos. 
                    Não feche a página durante o upload.
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-4">
                <label className="block mb-4">
                  <span className="text-sm text-zinc-400 mb-2 block">
                    Selecione um arquivo M3U/M3U8 (até 200MB)
                  </span>
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".m3u,.m3u8"
                    onChange={handleFileUpload}
                    className="mt-2 block w-full text-sm text-zinc-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-700 file:text-white
                      hover:file:bg-purple-600"
                    disabled={isProcessing}
                  />
                </label>

                {fileError && (
                  <div className="mt-2 p-3 bg-red-900/50 border border-red-700 rounded-md">
                    <p className="text-sm text-red-200">{fileError}</p>
                  </div>
                )}

                {importProgress && !showConfirmDialog && (
                  <div className="mt-4 p-4 bg-zinc-700/50 rounded-lg">
                    <div className="flex justify-between text-sm text-zinc-300 mb-2">
                      <span>
                        {importProgress.stage === 'downloading' && 'Lendo arquivo...'}
                        {importProgress.stage === 'parsing' && 'Processando canais...'}
                        {importProgress.stage === 'processing' && (importProgress.detail || 'Finalizando importação...')}
                      </span>
                      <span>{importProgress.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, importProgress.progress))}%` }}
                      />
                    </div>
                    {isProcessing && (
                      <div className="flex justify-center mt-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded mt-4">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Dialog 
        open={showConfirmDialog} 
        onOpenChange={(open) => {
          setShowConfirmDialog(open);
          if (!open) {
            handleCancelImport();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Lista</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4">
                <div>
                  Como você deseja importar a nova lista?
                  <div className="mt-2 text-sm text-gray-400">
                    Fonte: {pendingImport?.source}
                  </div>
                </div>

                {importProgress && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>
                        {importProgress.stage === 'downloading' && 'Baixando lista...'}
                        {importProgress.stage === 'parsing' && 'Processando canais...'}
                        {importProgress.stage === 'processing' && (importProgress.detail || 'Finalizando importação...')}
                      </span>
                      <span>{importProgress.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, importProgress.progress))}%` }}
                      />
                    </div>
                    {isProcessing && (
                      <div className="flex justify-center">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelImport}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleConfirmImport(false)}
              disabled={isProcessing}
            >
              Adicionar à Lista Atual
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleConfirmImport(true)}
              disabled={isProcessing}
            >
              Substituir Lista Atual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthProtection>
  );
}
