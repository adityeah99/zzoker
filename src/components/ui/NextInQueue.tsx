'use client';

import Image from 'next/image';
import { ListMusic } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';

interface Props {
  onOpenQueue: () => void;
}

const PREVIEW_COUNT = 4;

export default function NextInQueue({ onOpenQueue }: Props) {
  const { queue, queueIndex, playSong, currentSong } = usePlayer();
  const upNext = queue.slice(queueIndex + 1, queueIndex + 1 + PREVIEW_COUNT);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-semibold">Next in Queue</h3>
        <button
          onClick={onOpenQueue}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ListMusic size={12} />
          Open queue
        </button>
      </div>

      {upNext.length === 0 ? (
        <div className="py-3">
          <p className="text-white/30 text-xs">No songs in queue</p>
          {currentSong?.artists?.primary?.[0]?.name && (
            <p className="text-white/20 text-[11px] mt-1.5 leading-relaxed">
              Similar songs will auto-play when the queue ends
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {upNext.map((song, i) => {
            const realIdx = queueIndex + 1 + i;
            const artist = song.artists?.primary?.map((a) => a.name).join(', ') ?? '';
            return (
              <button
                key={`${song.id}-${realIdx}`}
                onClick={() => playSong(song, queue)}
                className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/10 active:bg-white/15 transition-colors text-left"
              >
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={getImageUrl(song.image, '50x50')}
                    alt={song.name}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium truncate">{song.name}</p>
                  <p className="text-white/40 text-[11px] truncate">{artist}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
