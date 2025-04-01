import React from 'react';
import { Heart, ThumbsUp, Laugh, Frown, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ReactionType } from '../../types/reactions';

interface ReactionButtonProps {
  type: ReactionType;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  wow: AlertTriangle,
  haha: Laugh,
  sad: Frown,
  angry: AlertTriangle
};

const reactionColors = {
  like: 'text-blue-500',
  love: 'text-red-500',
  wow: 'text-yellow-500',
  haha: 'text-yellow-500',
  sad: 'text-purple-500',
  angry: 'text-red-500'
};

export function ReactionButton({ 
  type, 
  active, 
  count = 0,
  onClick,
  disabled
}: ReactionButtonProps) {
  const Icon = reactionIcons[type];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full transition',
        'hover:bg-zinc-700/50',
        active && 'bg-zinc-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className={cn(
        'w-5 h-5',
        active && reactionColors[type]
      )} />
      {count > 0 && (
        <span className="text-sm font-medium">{count}</span>
      )}
    </button>
  );
}