import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/Toast';

export interface SystemSettings {
  id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export async function getSystemSettings(): Promise<SystemSettings | null> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return null;
  }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    toast({
      title: 'Configurações atualizadas',
      description: 'As configurações do sistema foram atualizadas com sucesso!'
    });

    return true;
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    toast({
      title: 'Erro ao atualizar',
      description: 'Não foi possível atualizar as configurações do sistema.',
      type: 'destructive'
    });
    return false;
  }
}
