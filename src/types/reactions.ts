import type { User } from '@supabase/supabase-js';

export type ReactionType = 'like' | 'love' | 'wow' | 'haha' | 'sad' | 'angry';

export interface Reaction {
  id: string;
  user_id: string;
  content_id: string;
  type: ReactionType;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  content_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
  };
}

export interface Rating {
  id: string;
  user_id: string;
  content_id: string;
  score: number;
  created_at: string;
}