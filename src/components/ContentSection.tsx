import { useRef, useEffect } from 'react';
import { Channel } from '../types/iptv';

interface ContentSectionProps {
  title: string;
  items: Channel[];
  onLoadMore?: () => void;
}

export function ContentSection({ title, items, onLoadMore }: ContentSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const loadTriggerRef = useRef<HTMLDivElement>(null);

  // Configura observer para carregar mais itens
  useEffect(() => {
    if (!onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadTriggerRef.current) {
      observerRef.current.observe(loadTriggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      const newScrollPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!items.length) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        
        <div className="relative group">
          {/* Botão Esquerdo */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Container de Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map(item => (
              <div
                key={item.id}
                className="flex-none w-64 relative group/item"
              >
                {/* Card */}
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                  {/* Placeholder ou Thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  
                  {/* Título no Hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <h3 className="text-white font-semibold truncate">{item.name}</h3>
                  </div>

                  {/* Play no Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Trigger para carregar mais */}
            {onLoadMore && (
              <div 
                ref={loadTriggerRef}
                className="flex-none w-4"
              />
            )}
          </div>

          {/* Botão Direito */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
