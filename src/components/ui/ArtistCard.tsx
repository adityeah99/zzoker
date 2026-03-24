'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import type { Artist } from '@/lib/types';

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const image = getImageUrl(artist.image);

  return (
    <Link href={`/artist/${artist.id}`}>
      <div className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer group">
        <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-lg">
          <Image
            src={image}
            alt={artist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 30vw, 160px"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-xl">
              <Play size={20} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white truncate max-w-[120px]">{artist.name}</p>
          <p className="text-xs text-white/40 mt-0.5">Artist</p>
        </div>
      </div>
    </Link>
  );
}
