import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GroupSelectorProps {
  groups: string[];
  selectedGroup: string | null;
  onSelectGroup: (group: string | null) => void;
}

export function GroupSelector({ groups, selectedGroup, onSelectGroup }: GroupSelectorProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {/* Botão de Scroll Esquerda */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Container dos Grupos com Scroll */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide relative"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Botão Todos */}
        <button
          onClick={() => onSelectGroup(null)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300
            ${!selectedGroup 
              ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white font-medium shadow-lg'
              : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
            }
          `}
        >
          Todos
        </button>

        {/* Botões dos Grupos */}
        {groups.map(group => (
          <button
            key={group}
            onClick={() => onSelectGroup(group)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300
              ${selectedGroup === group
                ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white font-medium shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
              }
            `}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Botão de Scroll Direita */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Gradientes para indicar scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-900 to-transparent pointer-events-none" />
    </div>
  );
}
