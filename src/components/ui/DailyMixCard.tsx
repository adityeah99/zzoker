'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import type { DailyMix } from '@/hooks/usePersonalization';

interface DailyMixCardProps {
  mix: DailyMix;
}

export default function DailyMixCard({ mix }: DailyMixCardProps) {
  const { playSong } = usePlayer();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mix.songs.length > 0) playSong(mix.songs[0], mix.songs);
  };

  return (
    <div className="flex flex-col gap-2 group cursor-pointer" onClick={handlePlay}>
      {/* Card */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
        {/* Background artwork */}
        <Image
          src={mix.coverImage}
          alt={mix.label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 40vw, 176px"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handlePlay}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
          >
            <Play size={20} className="text-black ml-0.5" fill="black" />
          </button>
        </div>

        {/* Bottom overlay: label left, number right */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3">
          {/* "Daily Mix" badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
            style={{ backgroundColor: mix.color, color: '#000' }}
          >
            {mix.label}
          </span>

          {/* Large number */}
          <span
            className="text-3xl font-black leading-none tabular-nums"
            style={{ color: mix.color, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            {mix.number}
          </span>
        </div>
      </div>

      {/* Below card: artist names */}
      <p className="text-xs text-white/50 truncate leading-relaxed px-0.5">{mix.artistNames}</p>
    </div>
  );
}
