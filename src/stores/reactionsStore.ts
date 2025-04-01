import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry';

export interface Comment {
  id: string;
  userId: string;
  contentId: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface Reaction {
  contentId: string;
  type: ReactionType;
  timestamp: string;
}

export interface Rating {
  contentId: string;
  score: number;
  timestamp: string;
}

interface ReactionsState {
  reactions: Reaction[];
  comments: Comment[];
  ratings: Rating[];
  addReaction: (contentId: string, type: ReactionType) => void;
  removeReaction: (contentId: string) => void;
  addComment: (contentId: string, text: string) => void;
  addRating: (contentId: string, score: number) => void;
  getContentReactions: (contentId: string) => Reaction[];
  getContentComments: (contentId: string) => Comment[];
  getContentRating: (contentId: string) => Rating | undefined;
}

export const useReactionsStore = create<ReactionsState>()(
  persist(
    (set, get) => ({
      reactions: [],
      comments: [],
      ratings: [],

      addReaction: (contentId: string, type: ReactionType) => {
        set((state) => {
          // Remove existing reaction if any
          const filteredReactions = state.reactions.filter(
            (r) => r.contentId !== contentId
          );

          return {
            reactions: [
              ...filteredReactions,
              {
                contentId,
                type,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeReaction: (contentId: string) => {
        set((state) => ({
          reactions: state.reactions.filter((r) => r.contentId !== contentId),
        }));
      },

      addComment: (contentId: string, text: string) => {
        set((state) => ({
          comments: [
            ...state.comments,
            {
              id: Math.random().toString(36).substr(2, 9),
              userId: 'current-user', // TODO: Integrate with user system
              contentId,
              text,
              createdAt: new Date().toISOString(),
              likes: 0,
            },
          ],
        }));
      },

      addRating: (contentId: string, score: number) => {
        set((state) => {
          const filteredRatings = state.ratings.filter(
            (r) => r.contentId !== contentId
          );

          return {
            ratings: [
              ...filteredRatings,
              {
                contentId,
                score,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        });
      },

      getContentReactions: (contentId: string) => {
        return get().reactions.filter((r) => r.contentId === contentId);
      },

      getContentComments: (contentId: string) => {
        return get().comments.filter((c) => c.contentId === contentId);
      },

      getContentRating: (contentId: string) => {
        return get().ratings.find((r) => r.contentId === contentId);
      },
    }),
    {
      name: 'reactions-storage',
    }
  )
);
