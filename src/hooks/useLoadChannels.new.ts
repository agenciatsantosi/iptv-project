import { useEffect } from 'react';
import { useIPTVStore } from '../store/iptvStore';

export function useLoadChannels() {
  const { 
    channels, 
    syncError, 
    isSyncing,
    syncFromCloud 
  } = useIPTVStore();

  useEffect(() => {
    console.log('Iniciando carregamento de canais do Supabase...');
    syncFromCloud().catch(error => {
      console.error('Erro ao carregar canais:', error);
    });
  }, [syncFromCloud]);

  return {
    channels,
    loading: isSyncing,
    error: syncError
  };
}
