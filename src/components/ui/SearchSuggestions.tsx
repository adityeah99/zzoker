'use client';

import Image from 'next/image';
import { Search, Plus } from 'lucide-react';
import type { SuggestionItem } from '@/lib/api';
import { getImageUrl } from '@/lib/api';
import type { Song } from '@/lib/types';

interface SearchSuggestionsProps {
  query: string;
  items: SuggestionItem[];
  loading: boolean;
  activeIndex: number;            // -1 = nothing selected
  onSelectQuery: (text: string) => void;
  onSelectSong: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onSetActiveIndex: (i: number) => void;
}

/** Wraps the matching prefix of `text` in a bold span. */
function HighlightPrefix({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <span>{text}</span>;
  const lo = text.toLowerCase();
  const ql = q.toLowerCase();
  const idx = lo.indexOf(ql);
  if (idx === -1) return <span className="text-white/60">{text}</span>;
  return (
    <span className="text-white/60">
      {text.slice(0, idx)}
      <span className="text-white font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </span>
  );
}

export default function SearchSuggestions({
  query,
  items,
  loading,
  activeIndex,
  onSelectQuery,
  onSelectSong,
  onAddToQueue,
  onSetActiveIndex,
}: SearchSuggestionsProps) {
  if (!loading && items.length === 0) return null;

  const queryItems  = items.filter((i) => i.type === 'query');
  const resultItems = items.filter((i) => i.type === 'song' || i.type === 'album');

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

      {/* Keyboard hints */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#141414] border-b border-white/5">
        <span className="text-[10px] text-white/25 font-medium">↑↓ Navigate</span>
        <span className="text-[10px] text-white/25">·</span>
        <span className="text-[10px] text-white/25 font-medium">↵ Search</span>
        <span className="text-[10px] text-white/25">·</span>
        <span className="text-[10px] text-white/25 font-medium">Esc Close</span>
      </div>

      {/* Loading shimmer */}
      {loading && items.length === 0 && (
        <div className="px-4 py-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 h-3 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Query suggestions */}
      {queryItems.length > 0 && (
        <div className="py-1">
          {queryItems.map((item, i) => {
            if (item.type !== 'query') return null;
            const isActive = activeIndex === i;
            return (
              <button
                key={item.text}
                onClick={() => onSelectQuery(item.text)}
                onMouseEnter={() => onSetActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                  isActive ? 'bg-white/8' : 'hover:bg-white/5'
                }`}
              >
                <Search size={15} className="text-white/30 shrink-0" />
                <span className="text-sm min-w-0 truncate">
                  <HighlightPrefix text={item.text} query={query} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Divider */}
      {queryItems.length > 0 && resultItems.length > 0 && (
        <div className="border-t border-white/5 mx-4" />
      )}

      {/* Song / Album results */}
      {resultItems.length > 0 && (
        <div className="py-1">
          {resultItems.map((item, rawIdx) => {
            const idx = queryItems.length + rawIdx;
            const isActive = activeIndex === idx;

            if (item.type === 'song') {
              const { song } = item;
              const artist = song.artists?.primary?.map((a) => a.name).join(', ') ?? '';
              const img = getImageUrl(song.image, '150x150');
              return (
                <div
                  key={song.id}
                  onMouseEnter={() => onSetActiveIndex(idx)}
                  className={`flex items-center gap-3 px-4 py-2 transition-colors group ${
                    isActive ? 'bg-white/8' : 'hover:bg-white/5'
                  }`}
                >
                  <button
                    onClick={() => onSelectSong(song)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image src={img} alt={song.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{song.name}</p>
                      <p className="text-white/40 text-xs truncate">Song · {artist}</p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToQueue(song); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-white/20 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Add to queue"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              );
            }

            if (item.type === 'album') {
              const { album } = item;
              const artist = album.artists?.primary?.map((a) => a.name).join(', ') ?? '';
              const img = getImageUrl(album.image, '150x150');
              return (
                <button
                  key={album.id}
                  onClick={() => onSelectQuery(album.name)}
                  onMouseEnter={() => onSetActiveIndex(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left ${
                    isActive ? 'bg-white/8' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <Image src={img} alt={album.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{album.name}</p>
                    <p className="text-white/40 text-xs truncate">Album · {artist}</p>
                  </div>
                </button>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
