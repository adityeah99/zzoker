'use client';

import Image from 'next/image';
import { Play, Pause, Heart, Download } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl, formatDuration } from '@/lib/api';
import { downloadSong, type DownloadQuality } from '@/lib/download';
import { useToast } from '@/components/ui/Toast';
import QualityPicker from '@/components/ui/QualityPicker';
import type { Song } from '@/lib/types';
import { useState, useEffect } from 'react';

interface SongRowProps {
  song: Song;
  index: number;
  queue: Song[];
  showAlbum?: boolean;
}

export default function SongRow({ song, index, queue, showAlbum = false }: SongRowProps) {
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isActive = currentSong?.id === song.id;

  useEffect(() => {
    const likedIds: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    setLiked(likedIds.includes(song.id));
  }, [song.id]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const likedIds: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    const updated = liked
      ? likedIds.filter((id) => id !== song.id)
      : [...likedIds, song.id];
    localStorage.setItem('likedSongs', JSON.stringify(updated));
    setLiked(!liked);
  };

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playSong(song, queue);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!song.downloadUrl?.length) {
      showToast('No download URL for this song', 'error');
      return;
    }
    setShowPicker(true);
  };

  const handleQualitySelect = async (quality: DownloadQuality) => {
    setShowPicker(false);
    setDownloading(true);
    showToast(`Downloading ${song.name}...`, 'info');
    try {
      await downloadSong(song, quality);
      showToast(`Downloaded ${song.name}`, 'success');
    } catch (e) {
      showToast(`Failed to download ${song.name}`, 'error');
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const artwork = getImageUrl(song.image, '50x50');
  const artistName = song.artists?.primary?.map((a) => a.name).join(', ') || '';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
      onClick={handlePlay}
      className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer group transition-colors ${
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      {/* Index / Play */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {hovered || isActive ? (
          isActive && isPlaying
            ? <Pause size={16} fill="currentColor" className="text-white" />
            : <Play size={16} fill="currentColor" className="text-white" />
        ) : (
          <span className={`text-sm tabular-nums ${isActive ? 'text-red-400' : 'text-white/40'}`}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Artwork */}
      <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0">
        <Image src={artwork} alt={song.name} fill className="object-cover" sizes="40px" />
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-red-400' : 'text-white'}`}>
          {song.name}
        </p>
        <p className="text-xs text-white/50 truncate">{artistName}</p>
      </div>

      {/* Album (optional) */}
      {showAlbum && (
        <p className="hidden md:block text-sm text-white/40 truncate w-40 shrink-0">
          {song.album?.name || ''}
        </p>
      )}

      {/* Like */}
      <button
        onClick={handleLike}
        className={`shrink-0 transition-colors ${
          liked ? 'text-red-500' : 'text-white/0 group-hover:text-white/40 hover:!text-red-500'
        }`}
      >
        <Heart size={16} fill={liked ? '#fc3c44' : 'none'} />
      </button>

      {/* Duration */}
      <span className="text-sm text-white/40 w-10 text-right shrink-0 tabular-nums">
        {song.duration ? formatDuration(song.duration) : '—'}
      </span>

      {/* Download button + quality picker */}
      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleDownloadClick}
          disabled={downloading}
          title="Download"
          className={`
            transition-colors
            md:text-white/0 md:group-hover:text-white/40 md:hover:!text-white
            text-white/40 hover:text-white
            ${downloading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Download size={16} className={downloading ? 'animate-bounce' : ''} />
        </button>

        {showPicker && (
          <QualityPicker
            onSelect={handleQualitySelect}
            onClose={() => setShowPicker(false)}
            position="above"
          />
        )}
      </div>
    </div>
  );
}
