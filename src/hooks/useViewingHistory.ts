import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { RecommendationService } from '../services/RecommendationService';

export function useViewingHistory() {
  const { user } = useAuthContext();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordView = async (
    contentId: string,
    contentType: string,
    duration: number,
    completed: boolean = false
  ) => {
    if (!user) return;
    
    try {
      setIsRecording(true);
      setError(null);
      await RecommendationService.recordView(
        user.id,
        contentId,
        contentType,
        duration,
        completed
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error recording view');
    } finally {
      setIsRecording(false);
    }
  };

  return {
    recordView,
    isRecording,
    error
  };
}
