import React from 'react';
import { Upload, AlertCircle, ShieldAlert } from 'lucide-react';
import { useIPTVPlaylist } from '../../hooks/useIPTVPlaylist';
import { useIPTVStore } from '../../store/iptvStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ProgressBar } from '../ui/ProgressBar';
import { useAdmin } from '../../hooks/useAdmin';
import { toast } from '../../hooks/useToast';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';

interface ImportProgress {
  stage: 'downloading' | 'parsing' | 'processing';
  progress: number;
  detail?: string;
}

interface PendingImport {
  content: string;
  source: string;
}

export function IPTVUploader() {
  const [url, setUrl] = React.useState('');
  const [importProgress, setImportProgress] = React.useState<ImportProgress | null>(null);
  const { importPlaylist, loading, error } = useIPTVPlaylist();
  const { addChannels, clearAll, activeList } = useIPTVStore();
  const { isAdmin } = useAdmin();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingImport, setPendingImport] = React.useState<PendingImport | null>(null);

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
      setImportProgress({ stage: 'parsing', progress: 0 });

      // Processar em lotes menores
      const BATCH_SIZE = 1000; // Processar 1000 canais por vez
      let processedChannels = 0;

      const channels = await importPlaylist(content, (progress) => {
        setImportProgress({
          stage: 'parsing',
          progress: Math.floor(progress.progress * 0.5) // Primeira metade do progresso
        });
      });
      
      if (!channels || channels.length === 0) {
        throw new Error('Nenhum canal válido encontrado. Verifique se o formato está correto.');
      }

      console.log('Canais processados:', channels.length);
      
      // Limpar lista se necessário
      if (shouldClear) {
        setImportProgress({ stage: 'processing', progress: 50 });
        await clearAll();
      }

      // Adicionar canais em lotes
      const totalChannels = channels.length;
      for (let i = 0; i < totalChannels; i += BATCH_SIZE) {
        const batch = channels.slice(i, i + BATCH_SIZE);
        await addChannels(batch, source);
        
        processedChannels += batch.length;
        const progress = 50 + Math.floor((processedChannels / totalChannels) * 50); // Segunda metade do progresso
        setImportProgress({ 
          stage: 'processing', 
          progress,
          detail: `Processando canais ${processedChannels} de ${totalChannels}`
        });

        // Pequena pausa para não travar a interface
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log('Lista importada com sucesso:', { totalChannels: processedChannels });
      toast({
        title: shouldClear ? 'Lista substituída com sucesso!' : 'Canais adicionados com sucesso!',
        description: `${processedChannels} canais foram ${shouldClear ? 'importados' : 'adicionados'} com sucesso.`,
        variant: 'default',
        duration: 5000
      });
      setUrl('');
      
    } catch (error) {
      handleImportError(error);
    } finally {
      setIsProcessing(false);
      setImportProgress(null);
    }
  };

  const handleConfirmImport = async (shouldClear: boolean = true) => {
    if (!pendingImport) {
      console.error('Nenhuma importação pendente');
      return;
    }
    
    console.log('Confirmação aceita, iniciando processamento');
    setShowConfirmDialog(false);
    await processImport(pendingImport.content, pendingImport.source, shouldClear);
    setPendingImport(null);
  };

  const handleCancelImport = () => {
    console.log('Importação cancelada pelo usuário');
    setShowConfirmDialog(false);
    setPendingImport(null);
    setIsProcessing(false);
    setImportProgress(null);
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const fileInput = React.useRef<HTMLInputElement>(null);

  const validateM3UFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
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

        // Verificar BOM e remover se necessário
        const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
        
        // Dividir em linhas e remover linhas vazias
        const lines = cleanContent.split(/\r?\n/).filter(line => line.trim());
        const firstLine = lines[0]?.trim();
        
        console.log('Primeira linha do arquivo:', {
          linha: firstLine,
          bytes: Array.from(firstLine || '').map(c => c.charCodeAt(0))
        });

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

        console.log('Validação do arquivo M3U:', {
          totalLinhas: lines.length,
          linhasExtInf: lines.filter(l => l.includes('#EXTINF:')).length,
          urlsEncontradas: urls.length,
          conteudoProcessado: processedContent.slice(0, 200) // Mostra o início do conteúdo processado
        });
        
        resolve(processedContent);
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo: ' + reader.error?.message));
      reader.readAsText(file);
    });
  };

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !isAdmin || isProcessing) return;

    try {
      // Validar URL
      try {
        new URL(url);
      } catch {
        throw new Error('URL inválida. Por favor, insira uma URL válida que aponte para uma lista M3U/M3U8');
      }

      await handleImport(url, url);
      
    } catch (error) {
      handleImportError(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin || isProcessing) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      console.log('Arquivo selecionado:', file.name);
      // Validações do arquivo
      if (!file.name.endsWith('.m3u') && !file.name.endsWith('.m3u8')) {
        throw new Error('Formato de arquivo inválido. Use apenas arquivos .m3u ou .m3u8');
      }

      const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). Máximo permitido: 100MB`);
      }

      if (file.size === 0) {
        throw new Error('O arquivo está vazio');
      }

      const content = await validateM3UFile(file);
      console.log('Arquivo validado, iniciando importação');
      await handleImport(content, file.name);

    } catch (error) {
      handleImportError(error);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    }
  };

  const handleImportError = (error: any) => {
    console.error('Erro ao processar arquivo:', error);
    setFileError(error instanceof Error ? error.message : 'Erro desconhecido ao importar lista');
    toast({
      title: 'Erro ao importar lista',
      description: error instanceof Error ? error.message : 'Erro desconhecido ao importar lista',
      variant: 'destructive',
      duration: 7000
    });
    setIsProcessing(false);
    setImportProgress(null);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2 text-yellow-500">
        <ShieldAlert className="w-5 h-5" />
        <p className="text-sm">Você precisa ser administrador para acessar esta área.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-zinc-800 rounded-lg p-6">
        {activeList ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Lista Ativa</h3>
                <p className="text-sm text-gray-400">{activeList}</p>
              </div>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Remover Lista
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Importar Lista IPTV</h2>
              <p className="text-gray-400">
                Importe sua lista M3U/M3U8 através de URL ou arquivo local
              </p>
            </div>

            <form onSubmit={handleUrlImport} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Cole a URL da lista M3U/M3U8"
                  className="flex-1 bg-zinc-700 rounded px-3 py-2"
                  disabled={isProcessing}
                />
                <Button 
                  type="submit" 
                  disabled={!url || isProcessing}
                  variant={isProcessing ? "secondary" : "default"}
                >
                  {isProcessing ? 'Importando...' : 'Importar URL'}
                </Button>
              </div>
            </form>

            <div className="border-t border-zinc-700 pt-4">
              <label className="block mb-4">
                <span className="text-sm text-zinc-400">Ou faça upload de um arquivo M3U/M3U8</span>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".m3u,.m3u8"
                  onChange={handleFileUpload}
                  className="mt-2 block w-full text-sm text-zinc-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-zinc-700 file:text-white
                    hover:file:bg-zinc-600"
                  disabled={isProcessing}
                />
              </label>

              {fileError && (
                <div className="mt-2 p-3 bg-red-900/50 border border-red-700 rounded-md">
                  <p className="text-sm text-red-200">{fileError}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Dialog 
        open={showConfirmDialog} 
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', { open, showConfirmDialog });
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
                    <ProgressBar value={importProgress.progress} />
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
    </>
  );
}