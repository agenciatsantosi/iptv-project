import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="h-full w-full border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full" />
    </div>
  );
}