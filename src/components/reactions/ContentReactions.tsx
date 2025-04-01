import React from 'react';
import { useReactions } from '../../hooks/useReactions';
import { ReactionButton } from './ReactionButton';
import { useAuthContext } from '../../contexts/AuthContext';
import type { ReactionType } from '../../types/reactions';

interface ContentReactionsProps {
  contentId: string;
}

export function ContentReactions({ contentId }: ContentReactionsProps) {
  const { isAuthenticated } = useAuthContext();
  const { 
    addReaction, 
    removeReaction, 
    loading, 
    reactionCounts,
    userReaction 
  } = useReactions(contentId);

  const handleReaction = async (type: ReactionType) => {
    if (!isAuthenticated) return;

    if (userReaction === type) {
      await removeReaction();
    } else {
      await addReaction(type);
    }
  };

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-gray-400">
        Faça login para reagir a este conteúdo
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ReactionButton
        type="like"
        active={userReaction === 'like'}
        count={reactionCounts.like}
        onClick={() => handleReaction('like')}
        disabled={loading}
      />
      <ReactionButton
        type="love"
        active={userReaction === 'love'}
        count={reactionCounts.love}
        onClick={() => handleReaction('love')}
        disabled={loading}
      />
      <ReactionButton
        type="wow"
        active={userReaction === 'wow'}
        count={reactionCounts.wow}
        onClick={() => handleReaction('wow')}
        disabled={loading}
      />
      <ReactionButton
        type="haha"
        active={userReaction === 'haha'}
        count={reactionCounts.haha}
        onClick={() => handleReaction('haha')}
        disabled={loading}
      />
      <ReactionButton
        type="sad"
        active={userReaction === 'sad'}
        count={reactionCounts.sad}
        onClick={() => handleReaction('sad')}
        disabled={loading}
      />
      <ReactionButton
        type="angry"
        active={userReaction === 'angry'}
        count={reactionCounts.angry}
        onClick={() => handleReaction('angry')}
        disabled={loading}
      />
    </div>
  );
}