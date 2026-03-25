'use client';

import { useRef } from 'react';

export type Genre =
  | 'All' | 'Trending' | 'New Releases' | 'Romantic'
  | 'Party' | 'Devotional' | 'Workout' | 'Sad' | 'Retro' | 'Indie';

export const GENRES: Genre[] = [
  'All', 'Trending', 'New Releases', 'Romantic',
  'Party', 'Devotional', 'Workout', 'Sad', 'Retro', 'Indie',
];

interface GenreFilterProps {
  active: Genre;
  onChange: (genre: Genre) => void;
}

export default function GenreFilter({ active, onChange }: GenreFilterProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-white/5">
      <div
        ref={rowRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-6 py-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {GENRES.map((genre) => {
          const isActive = genre === active;
          return (
            <button
              key={genre}
              onClick={() => onChange(genre)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#fc3c44] text-white shadow-lg shadow-red-500/25'
                  : 'bg-[#1c1c1e] text-white/60 hover:bg-[#2c2c2e] hover:text-white'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
