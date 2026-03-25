'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Play, ListEnd, Heart, Download, Share2, User, Disc3 } from 'lucide-react';
import Link from 'next/link';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import { downloadSong } from '@/lib/download';
import { useToast } from '@/components/ui/Toast';
import type { Song } from '@/lib/types';

interface Props {
  song: Song | null;
  onClose: () => void;
}

function OptionRow({
  icon,
  label,
  onClick,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-3.5 active:bg-white/5 transition-colors text-left ${className}`}
    >
      <span className="text-white/50 shrink-0">{icon}</span>
      <span className="text-white text-sm font-medium">{label}</span>
    </button>
  );
}

export default function SongOptionsSheet({ song, onClose }: Props) {
  const { addToQueue, playNext } = usePlayer();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!song) return;
    const ids: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    setLiked(ids.includes(song.id));
  }, [song?.id]);

  if (!song) return null;

  const artwork = getImageUrl(song.image, '150x150');
  const artistName = song.artists?.primary?.map((a) => a.name).join(', ') ?? '';
  const primaryArtist = song.artists?.primary?.[0];
  const albumId = song.album?.id;

  const handleLike = () => {
    const ids: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    const updated = liked ? ids.filter((id) => id !== song.id) : [...ids, song.id];
    localStorage.setItem('likedSongs', JSON.stringify(updated));
    setLiked(!liked);
    showToast(liked ? 'Removed from liked' : 'Added to liked songs', 'success');
  };

  const handlePlayNext = () => {
    playNext(song);
    showToast(`"${song.name}" will play next`, 'success');
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(song);
    showToast('Added to queue', 'success');
    onClose();
  };

  const handleDownload = async () => {
    onClose();
    showToast(`Downloading ${song.name}...`, 'info');
    try {
      await downloadSong(song, '320kbps');
      showToast(`Downloaded ${song.name}`, 'success');
    } catch {
      showToast('Download failed', 'error');
    }
  };

  const handleShare = async () => {
    onClose();
    if (navigator.share) {
      await navigator.share({
        title: song.name,
        text: `${song.name} by ${artistName}`,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(window.location.origin).catch(() => {});
      showToast('Link copied!', 'success');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[130] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[140] bg-[#1c1c1e] rounded-t-3xl animate-in slide-in-from-bottom duration-250 overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

        {/* Song header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
            <Image src={artwork} alt={song.name} fill className="object-cover" sizes="48px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{song.name}</p>
            <p className="text-white/50 text-xs truncate">{artistName}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="py-1">
          <OptionRow icon={<Play size={18} />} label="Play Next" onClick={handlePlayNext} />
          <OptionRow icon={<ListEnd size={18} />} label="Add to Queue" onClick={handleAddToQueue} />
          <div className="border-t border-white/5 my-1" />
          <OptionRow
            icon={<Heart size={18} fill={liked ? '#fc3c44' : 'none'} className={liked ? 'text-red-500' : ''} />}
            label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            onClick={handleLike}
          />
          <OptionRow icon={<Download size={18} />} label="Download" onClick={handleDownload} />
          <OptionRow icon={<Share2 size={18} />} label="Share" onClick={handleShare} />
          {primaryArtist && (
            <div className="border-t border-white/5 my-1" />
          )}
          {primaryArtist && (
            <Link href={`/artist/${primaryArtist.id}`} onClick={onClose}>
              <OptionRow
                icon={<User size={18} />}
                label={`Go to ${primaryArtist.name}`}
                onClick={() => {}}
              />
            </Link>
          )}
          {albumId && (
            <Link href={`/album/${albumId}`} onClick={onClose}>
              <OptionRow
                icon={<Disc3 size={18} />}
                label={`Go to Album`}
                onClick={() => {}}
              />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
