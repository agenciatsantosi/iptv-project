import { useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface ViewingSession {
  id: string;
  contentId: string;
  contentType: string;
  quality?: string;
  bufferingCount: number;
  errorCount: number;
}

export function useAnalytics() {
  const { user } = useAuth();

  // Registrar evento genérico
  const trackEvent = useCallback(async (
    eventType: string,
    contentId?: string,
    contentType?: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`
      };

      await supabase.rpc('log_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_content_id: contentId,
        p_content_type: contentType,
        p_device_info: deviceInfo,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
    }
  }, [user]);

  // Iniciar sessão de visualização
  const startViewingSession = useCallback(async (
    contentId: string,
    contentType: string,
    quality: string = 'auto'
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('start_viewing_session', {
        p_user_id: user.id,
        p_content_id: contentId,
        p_content_type: contentType,
        p_quality: quality
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      return null;
    }
  }, [user]);

  // Finalizar sessão de visualização
  const endViewingSession = useCallback(async (
    sessionId: string,
    bufferingCount: number = 0,
    errorCount: number = 0
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('end_viewing_session', {
        p_session_id: sessionId,
        p_buffering_count: bufferingCount,
        p_error_count: errorCount
      });
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  }, [user]);

  // Buscar conteúdo popular
  const getPopularContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('popular_content')
        .select('*')
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar conteúdo popular:', error);
      return [];
    }
  }, []);

  // Exemplo de uso do analytics em componentes
  useEffect(() => {
    // Registrar visualização da página
    trackEvent('page_view', undefined, undefined, {
      path: window.location.pathname
    });
  }, [trackEvent]);

  return {
    trackEvent,
    startViewingSession,
    endViewingSession,
    getPopularContent
  };
}