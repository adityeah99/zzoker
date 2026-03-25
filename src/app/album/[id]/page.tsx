'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getAlbum } from '@/lib/api';
import AlbumClient from './AlbumClient';
import type { Album } from '@/lib/types';
import { RowSkeleton } from '@/components/ui/LoadingSkeleton';

function MobileBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="md:hidden fixed top-4 left-4 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
    >
      <ChevronLeft size={18} />
    </button>
  );
}

export default function AlbumPage({ params }: { params: { id: string } }) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAlbum(params.id)
      .then(setAlbum)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="space-y-2 pt-8 px-4">
      <div className="flex gap-6 px-2 pb-6">
        <div className="w-48 h-48 rounded-2xl bg-white/10 animate-pulse shrink-0" />
        <div className="flex-1 space-y-3 pt-6">
          <div className="h-10 w-2/3 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)}
    </div>
  );

  if (error || !album) return (
    <div className="flex items-center justify-center h-64 text-white/30">
      <p>{error || 'Album not found'}</p>
    </div>
  );

  return <><MobileBackButton /><AlbumClient album={album} /></>;
}
