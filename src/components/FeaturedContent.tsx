import { useState, useEffect } from 'react';
import { useIPTVStore } from '../store/iptvStore';
import { Channel } from '../types/iptv';

export function FeaturedContent() {
  const { movies, series } = useIPTVStore();
  const [featured, setFeatured] = useState<Channel | null>(null);

  useEffect(() => {
    // Seleciona um conteúdo aleatório dos filmes ou séries
    const allContent = [...movies, ...series];
    if (allContent.length > 0) {
      const randomIndex = Math.floor(Math.random() * allContent.length);
      setFeatured(allContent[randomIndex]);
    }
  }, [movies, series]);

  if (!featured) return null;

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Gradiente de sobreposição */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10" />
      
      {/* Background */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-50"
        style={{
          backgroundImage: 'url(/placeholder-image.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-20 h-full flex flex-col justify-end p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {featured.name}
        </h1>
        
        <div className="flex gap-4 mb-8">
          <button className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            Assistir
          </button>
          
          <button className="px-8 py-3 bg-gray-500 bg-opacity-50 text-white rounded-lg font-semibold hover:bg-opacity-70 transition flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mais Informações
          </button>
        </div>
      </div>
    </div>
  );
}
