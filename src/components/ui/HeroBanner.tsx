'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import type { Song, Album, Playlist } from '@/lib/types';
import Link from 'next/link';

interface HeroBannerProps {
  item: Song | Album | Playlist;
  type: 'song' | 'album' | 'playlist';
}

export default function HeroBanner({ item, type }: HeroBannerProps) {
  const { playSong } = usePlayer();
  const image = getImageUrl(item.image, '500x500');

  const handlePlay = () => {
    if (type === 'song') {
      playSong(item as Song);
    }
  };

  const href = type === 'album' ? `/album/${item.id}` : type === 'playlist' ? `/playlist/${item.id}` : '#';

  return (
    <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden group">
      {/* Background blur image */}
      <Image
        src={image}
        alt={item.name}
        fill
        className="object-cover scale-110 blur-sm opacity-50"
        sizes="100vw"
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end p-8 md:p-12">
        <div className="flex items-end gap-6">
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-2xl shrink-0">
            <Image src={image} alt={item.name} fill className="object-cover" sizes="192px" />
          </div>
          <div>
            <p className="text-white/50 text-sm font-medium uppercase tracking-widest mb-2">
              {type === 'song' ? 'Song' : type === 'album' ? 'Album' : 'Playlist'}
            </p>
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-3 leading-tight">
              {item.name}
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                <Play size={18} fill="white" />
                Play
              </button>
              {type !== 'song' && (
                <Link
                  href={href}
                  className="px-6 py-2.5 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors text-sm"
                >
                  View All
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
