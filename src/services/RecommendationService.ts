import { supabase } from '../lib/supabase';

interface ViewingHistory {
  content_id: string;
  content_type: string;
  watch_duration: number;
  completed: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  genres: string[];
  type: string;
  poster_path: string;
}

export class RecommendationService {
  static async recordView(
    userId: string,
    contentId: string,
    contentType: string,
    duration: number,
    completed: boolean = false
  ) {
    return await supabase.from('viewing_history').insert({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      watch_duration: duration,
      completed
    });
  }

  static async getRecommendations(userId: string, limit: number = 20): Promise<ContentItem[]> {
    // 1. Get user's viewing history
    const { data: history } = await supabase
      .from('viewing_history')
      .select('*')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false })
      .limit(50);

    if (!history?.length) {
      // If no history, return trending content
      return this.getTrendingContent(limit);
    }

    // 2. Calculate genre preferences
    const genreScores = this.calculateGenreScores(history);

    // 3. Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 4. Get recommended content
    const { data: recommendations } = await supabase
      .from('content')
      .select('*')
      .in('genres', Object.keys(genreScores))
      .not('id', 'in', history.map(h => h.content_id))
      .limit(limit);

    return this.rankContent(recommendations || [], genreScores, preferences);
  }

  private static async getTrendingContent(limit: number): Promise<ContentItem[]> {
    const { data } = await supabase
      .from('content')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private static calculateGenreScores(history: ViewingHistory[]): Record<string, number> {
    const scores: Record<string, number> = {};

    history.forEach(item => {
      // Add weight based on watch duration and completion
      const weight = item.completed ? 2 : (item.watch_duration > 900 ? 1.5 : 1);
      
      // Update scores for each genre
      if (item.genres) {
        item.genres.forEach(genre => {
          scores[genre] = (scores[genre] || 0) + weight;
        });
      }
    });

    return scores;
  }

  private static rankContent(
    content: ContentItem[],
    genreScores: Record<string, number>,
    preferences: any
  ): ContentItem[] {
    return content.sort((a, b) => {
      const scoreA = this.calculateContentScore(a, genreScores, preferences);
      const scoreB = this.calculateContentScore(b, genreScores, preferences);
      return scoreB - scoreA;
    });
  }

  private static calculateContentScore(
    content: ContentItem,
    genreScores: Record<string, number>,
    preferences: any
  ): number {
    let score = 0;

    // Add score based on matching genres
    content.genres.forEach(genre => {
      score += genreScores[genre] || 0;
    });

    // Boost score if content matches user preferences
    if (preferences?.preferred_genres) {
      const preferredGenreMatch = content.genres.some(g => 
        preferences.preferred_genres.includes(g)
      );
      if (preferredGenreMatch) score *= 1.5;
    }

    return score;
  }
}
