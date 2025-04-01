import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Channel } from '../../types/iptv';
import { ContentCard } from './ContentCard';
import { WatchButton } from '../watch/WatchButton';

interface ContentRowProps {
  title: string;
  items: Channel[];
  seeAllLink?: string;
}

export function ContentRow({ title, items, seeAllLink }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    const row = rowRef.current;
    if (!row) return;

    const scrollAmount = direction === 'left' ? -row.clientWidth : row.clientWidth;
    row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const row = rowRef.current;
    if (!row) return;

    setShowLeftButton(row.scrollLeft > 0);
    setShowRightButton(row.scrollLeft < row.scrollWidth - row.clientWidth - 10);
  };

  return (
    <div className="relative px-4 md:px-16 group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {seeAllLink && (
          <Link 
            to={seeAllLink}
            className="text-sm text-purple-500 hover:text-purple-400 transition-colors"
          >
            Ver todos
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Left Button */}
        {showLeftButton && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Content */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-none w-[200px] relative">
              <ContentCard channel={item} />
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <WatchButton contentId={item.id} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Button */}
        {showRightButton && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}
