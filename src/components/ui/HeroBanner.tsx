'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import type { Album } from '@/lib/types';

interface HeroBannerProps {
  items: Album[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = items.length;

  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count]);

  // Reset timer when manually navigating
  const go = useCallback((n: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    n();
    if (!paused) {
      timerRef.current = setInterval(next, 5000);
    }
  }, [paused, next]);

  useEffect(() => {
    if (paused || count < 2) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next, count]);

  if (!items.length) return null;

  const item = items[idx];
  const image = getImageUrl(item.image, '500x500');
  const artistName = item.artists?.primary?.map((a) => a.name).join(', ') ?? '';

  return (
    <div
      className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Blurred background */}
      <div className="absolute inset-0 transition-all duration-700">
        <Image
          src={image}
          alt={item.name}
          fill
          className="object-cover scale-110 blur-sm opacity-50"
          sizes="100vw"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end p-6 md:p-10">
        <div className="flex items-end gap-5 w-full">
          {/* Artwork */}
          <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-xl overflow-hidden shadow-2xl shrink-0">
            <Image src={image} alt={item.name} fill className="object-cover" sizes="176px" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pb-1">
            {/* Badge */}
            <span className="inline-block bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">
              Just Dropped
            </span>
            <h2 className="text-white text-2xl md:text-4xl font-bold leading-tight truncate">
              {item.name}
            </h2>
            {artistName && (
              <p className="text-white/60 text-sm mt-1 truncate">{artistName}</p>
            )}
            <div className="flex items-center gap-3 mt-4">
              <Link
                href={`/album/${item.id}`}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm"
              >
                <Play size={15} fill="white" />
                Play
              </Link>
              <Link
                href={`/album/${item.id}`}
                className="px-5 py-2.5 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors text-sm"
              >
                View Album
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(prev)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(next)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => go(() => setIdx(i))}
              className={`rounded-full transition-all duration-300 ${
                i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
