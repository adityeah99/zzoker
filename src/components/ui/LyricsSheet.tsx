'use client';

import { useEffect, useState } from 'react';
import { X, Mic2 } from 'lucide-react';
import { getSongLyrics } from '@/lib/api';

interface LyricsSheetProps {
  open: boolean;
  onClose: () => void;
  songId: string | null;
  songName: string;
}

export default function LyricsSheet({ open, onClose, songId, songName }: LyricsSheetProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !songId) return;
    setLyrics(null);
    setLoading(true);
    getSongLyrics(songId)
      .then((res) => setLyrics(res?.lyrics ?? null))
      .catch(() => setLyrics(null))
      .finally(() => setLoading(false));
  }, [open, songId]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-[110] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[120] bg-[#111] rounded-t-3xl transition-transform duration-300 ease-out max-h-[80vh] flex flex-col ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Mic2 size={18} className="text-white/60" />
            <h3 className="text-white font-semibold text-base truncate max-w-[70vw]">{songName}</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 pb-10 scrollbar-hide">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
            </div>
          ) : lyrics ? (
            <pre className="text-white/80 text-sm leading-7 font-sans whitespace-pre-wrap">{lyrics}</pre>
          ) : (
            <div className="py-16 text-center">
              <Mic2 size={36} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Lyrics not available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
