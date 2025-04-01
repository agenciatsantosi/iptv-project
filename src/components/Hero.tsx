import React from 'react';
import { Play, Info } from 'lucide-react';

interface HeroProps {
  title: string;
  description: string;
  imageUrl: string;
}

export function Hero({ title, description, imageUrl }: HeroProps) {
  return (
    <div className="relative h-[85vh] w-full">
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/60 to-transparent" />
      </div>
      
      <div className="relative h-full flex items-center px-4 md:px-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg text-gray-200 mb-8">{description}</p>
          <div className="flex space-x-4">
            <button className="flex items-center px-6 py-3 bg-white rounded-md hover:bg-gray-200 transition">
              <Play className="w-5 h-5 mr-2" />
              <span className="font-semibold">Assistir</span>
            </button>
            <button className="flex items-center px-6 py-3 bg-gray-500/70 text-white rounded-md hover:bg-gray-500/90 transition">
              <Info className="w-5 h-5 mr-2" />
              <span>Mais Informações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}