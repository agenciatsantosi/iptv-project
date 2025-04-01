import React from 'react';
import { IPTVUploader } from '../../components/iptv/IPTVUploader';
import { ContentStats } from '../../components/iptv/ContentStats';
import { useIPTVStore } from '../../store/iptvStore';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

export function AdminIPTVPage() {
  const { movies, series, live, activeList, clearAll } = useIPTVStore();
  const { toast } = useToast();
  const hasContent = movies.length > 0 || series.length > 0 || live.length > 0;

  const handleClearList = async () => {
    try {
      await clearAll();
      toast({
        title: "Lista removida",
        description: "A lista IPTV foi removida com sucesso.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover a lista IPTV.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Listas IPTV</h1>
      </div>

      {hasContent && (
        <>
          <div className="bg-zinc-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Lista Ativa</h2>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearList}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remover Lista
              </Button>
            </div>
            <div className="text-sm text-zinc-400 mb-4">
              {activeList ? (
                <p>Fonte atual: {activeList}</p>
              ) : (
                <p>Lista importada localmente</p>
              )}
            </div>
            <ContentStats />
          </div>
        </>
      )}

      <div className="bg-zinc-800 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Importar Nova Lista</h2>
        <IPTVUploader />
      </div>
    </div>
  );
}
