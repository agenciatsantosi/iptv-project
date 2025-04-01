import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
      <AlertCircle className="w-5 h-5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}