import { supabase } from '../lib/supabase';

export interface SocialMedia {
  id?: string;
  name: string;
  url: string;
  icon: string;
  active: boolean;
  order?: number;
}

// Lista de ícones disponíveis para redes sociais
export const SOCIAL_MEDIA_ICONS = {
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  facebook: 'facebook',
  instagram: 'instagram',
  twitter: 'twitter',
  youtube: 'youtube',
  tiktok: 'tiktok',
  discord: 'discord',
  reddit: 'reddit',
  pinterest: 'pinterest',
  linkedin: 'linkedin',
  snapchat: 'snapchat',
  twitch: 'twitch',
};

// Função para buscar todas as redes sociais
export const fetchSocialMedia = async (): Promise<SocialMedia[]> => {
  try {
    const { data, error } = await supabase
      .from('social_media')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar redes sociais:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar redes sociais:', error);
    return [];
  }
};

// Função para buscar apenas redes sociais ativas
export const fetchActiveSocialMedia = async (): Promise<SocialMedia[]> => {
  try {
    const { data, error } = await supabase
      .from('social_media')
      .select('*')
      .eq('active', true)
      .order('order', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar redes sociais ativas:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar redes sociais ativas:', error);
    return [];
  }
};

// Função para adicionar uma nova rede social
export const addSocialMedia = async (socialMedia: Omit<SocialMedia, 'id'>): Promise<SocialMedia | null> => {
  try {
    const { data, error } = await supabase
      .from('social_media')
      .insert([socialMedia])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar rede social:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao adicionar rede social:', error);
    return null;
  }
};

// Função para atualizar uma rede social existente
export const updateSocialMedia = async (id: string, updates: Partial<SocialMedia>): Promise<SocialMedia | null> => {
  try {
    const { data, error } = await supabase
      .from('social_media')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar rede social:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao atualizar rede social:', error);
    return null;
  }
};

// Função para excluir uma rede social
export const deleteSocialMedia = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('social_media')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir rede social:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir rede social:', error);
    return false;
  }
};
