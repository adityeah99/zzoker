'use client';

import Image from 'next/image';
import { X, ListMusic } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';

interface QueuePanelProps {
  open: boolean;
  onClose: () => void;
}

export default function QueuePanel({ open, onClose }: QueuePanelProps) {
  const { currentSong, queue, queueIndex, removeFromQueue, clearQueue } = usePlayer();

  const upNext = queue.slice(queueIndex + 1);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-[110] transition-opacity duration-300 ${
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
            <ListMusic size={18} className="text-white/60" />
            <h3 className="text-white font-semibold text-base">Queue</h3>
            <span className="text-white/30 text-sm">({upNext.length} songs)</span>
          </div>
          <div className="flex items-center gap-3">
            {upNext.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-white/40 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-8 scrollbar-hide">
          {/* Now Playing */}
          {currentSong && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">Now Playing</p>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={getImageUrl(currentSong.image, '150x150')}
                    alt={currentSong.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{currentSong.name}</p>
                  <p className="text-white/40 text-xs truncate">
                    {currentSong.artists?.primary?.map((a) => a.name).join(', ')}
                  </p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-0.5 h-3 bg-red-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Up Next */}
          {upNext.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Up Next</p>
              <div className="space-y-1">
                {upNext.map((song, i) => {
                  const realIdx = queueIndex + 1 + i;
                  const artist = song.artists?.primary?.map((a) => a.name).join(', ');
                  return (
                    <div key={`${song.id}-${realIdx}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 group transition-colors">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={getImageUrl(song.image, '150x150')}
                          alt={song.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm truncate">{song.name}</p>
                        <p className="text-white/40 text-xs truncate">{artist}</p>
                      </div>
                      <button
                        onClick={() => removeFromQueue(realIdx)}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-white/20 hover:text-white/60 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-white/30 text-sm">Queue is empty</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
