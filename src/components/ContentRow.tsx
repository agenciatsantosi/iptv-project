import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContentRowProps {
  title: string;
  items: Array<{
    id: string;
    title: string;
    logo: string;
  }>;
}

export function ContentRow({ title, items }: ContentRowProps) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = React.useState(false);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);

    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-1 h-40 md:h-48">
      <h2 className="text-white text-xl md:text-2xl font-semibold pl-4 md:pl-16">{title}</h2>
      
      <div className="group relative md:-ml-2">
        <ChevronLeft
          className={cn(
            'absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100',
            !isMoved && 'hidden'
          )}
          onClick={() => handleClick('left')}
        />

        <div
          ref={rowRef}
          className="flex items-center space-x-2 overflow-x-scroll scrollbar-hide md:space-x-4 md:p-2"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105"
            >
              <img
                src={item.logo}
                alt={item.title}
                className="rounded-sm object-cover md:rounded"
              />
            </div>
          ))}
        </div>

        <ChevronRight
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100"
          onClick={() => handleClick('right')}
        />
      </div>
    </div>
  );
}