import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cnCondicao(condicao: boolean, classe: string, classeAlternativa?: string) {
  if (condicao) {
    return cn(classe);
  } else {
    return cn(classeAlternativa);
  }
}