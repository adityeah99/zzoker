'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import type { Song, Album, Playlist } from '@/lib/types';
import Link from 'next/link';

interface SongCardProps {
  item: Song | Album | Playlist;
  type: 'song' | 'album' | 'playlist';
  queue?: Song[];
}

export default function SongCard({ item, type, queue }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = type === 'song' && currentSong?.id === item.id;

  const artwork = getImageUrl(item.image);
  const subtitle =
    type === 'album'
      ? (item as Album).artists?.primary?.map((a) => a.name).join(', ') || ''
      : type === 'playlist'
      ? `${(item as Playlist).songCount || 0} songs`
      : (item as Song).artists?.primary?.map((a) => a.name).join(', ') || '';

  const handlePlay = () => {
    if (type === 'song') {
      playSong(item as Song, queue || [item as Song]);
    }
  };

  const Wrapper = type === 'song' ? 'div' : 'div';

  const inner = (
    <div className="bg-[#1c1c1e] rounded-xl p-3 hover:bg-[#2c2c2e] transition-all duration-200 cursor-pointer group">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3">
        <Image
          src={artwork}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 40vw, 180px"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handlePlay}
            className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
          >
            <Play size={20} fill="white" className="text-white ml-0.5" />
          </button>
        </div>
        {isActive && isPlaying && (
          <div className="absolute bottom-2 right-2 flex gap-0.5 items-end">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-bounce"
                style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>
      <p className={`text-sm font-medium truncate ${isActive ? 'text-red-400' : 'text-white'}`}>
        {item.name}
      </p>
      <p className="text-xs text-white/50 truncate mt-0.5">{subtitle}</p>
    </div>
  );

  if (type === 'album') {
    return <Link href={`/album/${item.id}`}>{inner}</Link>;
  }
  if (type === 'playlist') {
    return <Link href={`/playlist/${item.id}`}>{inner}</Link>;
  }
  return <Wrapper>{inner}</Wrapper>;
}
