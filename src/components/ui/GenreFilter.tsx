'use client';

import { useRef } from 'react';

export type Genre =
  | 'All' | 'Trending' | 'New Releases' | 'Romantic'
  | 'Party' | 'Devotional' | 'Workout' | 'Sad' | 'Retro' | 'Indie';

export type EnglishSubFilter = 'All English' | 'Rap' | 'Hip Hop' | 'Pop' | 'R&B';

export const GENRES: Genre[] = [
  'All', 'Trending', 'New Releases', 'Romantic',
  'Party', 'Devotional', 'Workout', 'Sad', 'Retro', 'Indie',
];

export const ENGLISH_SUB_FILTERS: EnglishSubFilter[] = [
  'All English', 'Rap', 'Hip Hop', 'Pop', 'R&B',
];

interface GenreFilterProps {
  active: Genre;
  onChange: (genre: Genre) => void;
  isEnglishActive?: boolean;
  activeEnglishSub?: EnglishSubFilter;
  onEnglishSubChange?: (sub: EnglishSubFilter) => void;
}

export default function GenreFilter({
  active,
  onChange,
  isEnglishActive = false,
  activeEnglishSub = 'All English',
  onEnglishSubChange,
}: GenreFilterProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-white/5">
      {/* Main genre pills */}
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

      {/* English sub-filter row — only visible when English is selected */}
      {isEnglishActive && (
        <div
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-6 pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Label */}
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-white/25 mr-1">
            English
          </span>
          {ENGLISH_SUB_FILTERS.map((sub) => {
            const isActive = sub === activeEnglishSub;
            return (
              <button
                key={sub}
                onClick={() => onEnglishSubChange?.(sub)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                }`}
              >
                {sub === 'Rap' ? '🎤 Rap' : sub === 'Hip Hop' ? '🔊 Hip Hop' : sub === 'Pop' ? '🎵 Pop' : sub === 'R&B' ? '🎶 R&B' : sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
