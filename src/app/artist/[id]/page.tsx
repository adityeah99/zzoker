'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getArtist } from '@/lib/api';
import ArtistPageClient from './ArtistPageClient';
import type { Artist } from '@/lib/types';
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

export default function ArtistPage({ params }: { params: { id: string } }) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArtist(params.id)
      .then(setArtist)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="space-y-2">
      <div className="w-full h-72 md:h-96 bg-white/5 animate-pulse" />
      <div className="px-6 pt-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    </div>
  );

  if (error || !artist) return (
    <div className="flex items-center justify-center h-64 text-white/30">
      <p>{error || 'Artist not found'}</p>
    </div>
  );

  return <><MobileBackButton /><ArtistPageClient artist={artist} /></>;
}
