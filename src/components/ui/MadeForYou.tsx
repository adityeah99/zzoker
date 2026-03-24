'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DailyMixCard from './DailyMixCard';
import { usePersonalization } from '@/hooks/usePersonalization';

interface MadeForYouProps {
  username: string;
}

function MixSkeleton() {
  return (
    <div className="shrink-0 w-40 md:w-44 animate-pulse">
      <div className="aspect-square rounded-xl bg-white/10 mb-2" />
      <div className="h-3 bg-white/10 rounded w-3/4" />
    </div>
  );
}

export default function MadeForYou({ username }: MadeForYouProps) {
  const { dailyMixes, loading } = usePersonalization();
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    rowRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const displayName = username || 'You';

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-white text-xl font-bold">
            <span className="text-white/40 font-normal">Made For </span>
            {displayName}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Cards row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <MixSkeleton key={i} />)
          : dailyMixes.map((mix) => (
              <div key={mix.id} className="shrink-0 w-40 md:w-44">
                <DailyMixCard mix={mix} />
              </div>
            ))}
      </div>
    </section>
  );
}
