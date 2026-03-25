'use client';

import Image from 'next/image';
import { Play, Shuffle, Plus, Share2, ChevronLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import { downloadAll, type DownloadQuality } from '@/lib/download';
import { useToast } from '@/components/ui/Toast';
import SongRow from '@/components/ui/SongRow';
import SongOptionsSheet from '@/components/ui/SongOptionsSheet';
import type { Album, Song } from '@/lib/types';
import Link from 'next/link';

interface Props { album: Album }

export default function AlbumClient({ album }: Props) {
  const router = useRouter();
  const { playSong } = usePlayer();
  const { showToast } = useToast();
  const songs = album.songs ?? [];
  const artwork = getImageUrl(album.image, '500x500');
  const primaryArtists = album.artists?.primary ?? [];
  const artistNames = primaryArtists.map((a) => a.name).join(', ');

  const [expanded, setExpanded] = useState(false);
  const [optionsSong, setOptionsSong] = useState<Song | null>(null);
  const [dlProgress, setDlProgress] = useState<{ done: number; total: number } | null>(null);

  const description = album.description ?? '';
  const TRIM = 140;
  const isLong = description.length > TRIM;
  const displayDesc = expanded || !isLong ? description : description.slice(0, TRIM) + '…';

  const handlePlay = () => {
    if (songs.length > 0) playSong(songs[0], songs);
  };

  const handleShuffle = () => {
    if (songs.length === 0) return;
    const idx = Math.floor(Math.random() * songs.length);
    playSong(songs[idx], songs);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: album.name, text: artistNames, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(window.location.href).catch(() => {});
      showToast('Link copied!', 'success');
    }
  };

  const handleDownloadAll = async (quality: DownloadQuality) => {
    showToast(`Starting download of ${songs.length} songs…`, 'info');
    setDlProgress({ done: 0, total: songs.length });
    try {
      await downloadAll(songs, quality, (done, total) => {
        setDlProgress({ done, total });
      });
      showToast(`Downloaded all ${songs.length} songs!`, 'success');
    } catch {
      showToast('Some downloads failed', 'error');
    } finally {
      setDlProgress(null);
    }
  };
  void handleDownloadAll; // used by future download-all button if added

  const badges = [
    album.language && album.language.charAt(0).toUpperCase() + album.language.slice(1),
    album.year,
    (album.songCount ?? songs.length) ? `${album.songCount ?? songs.length} songs` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-black">
      {/* ── Fixed top navigation ── */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{ paddingTop: 'env(safe-area-inset-top, 16px)', paddingBottom: '8px' }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleShare}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white border border-white/10 active:scale-90 transition-transform"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="relative pb-8" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}>
        {/* Blurred background */}
        <div className="absolute inset-0 overflow-hidden" style={{ height: '440px' }}>
          <Image
            src={artwork}
            alt={album.name}
            fill
            className="object-cover scale-110 blur-3xl opacity-40"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black" />
        </div>

        {/* Centered content */}
        <div className="relative flex flex-col items-center px-6 pt-4">
          {/* Artwork */}
          <div className="relative w-52 h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.7)] mb-6">
            <Image src={artwork} alt={album.name} fill className="object-cover" sizes="240px" priority />
          </div>

          {/* Title */}
          <h1 className="text-white text-2xl md:text-3xl font-bold text-center leading-tight mb-1 px-2">
            {album.name}
          </h1>

          {/* Artist links */}
          <div className="flex flex-wrap justify-center gap-x-1 mb-3">
            {primaryArtists.length > 0 ? (
              primaryArtists.map((a, i) => (
                <span key={a.id}>
                  <Link href={`/artist/${a.id}`} className="text-red-400 text-sm font-medium hover:text-red-300 transition-colors">
                    {a.name}
                  </Link>
                  {i < primaryArtists.length - 1 && <span className="text-white/40 text-sm">, </span>}
                </span>
              ))
            ) : (
              <span className="text-white/40 text-sm">{artistNames || 'Various Artists'}</span>
            )}
          </div>

          {/* Badges row */}
          {badges.length > 0 && (
            <p className="text-white/40 text-xs mb-6 text-center">
              {badges.join(' · ')}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mb-6">
            {/* Shuffle */}
            <button
              onClick={handleShuffle}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all"
              title="Shuffle"
            >
              <Shuffle size={20} />
            </button>

            {/* Play */}
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 bg-white hover:bg-white/90 active:scale-95 text-black font-bold px-8 py-3 rounded-full transition-all text-sm shadow-xl"
            >
              <Play size={18} fill="black" className="ml-0.5" />
              Play
            </button>

            {/* Add to library */}
            <button
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all"
              title="Add to Library"
              onClick={() => showToast('Added to library', 'success')}
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Description */}
          {description && (
            <div className="w-full mb-2">
              <p className="text-white/50 text-sm leading-relaxed">{displayDesc}</p>
              {isLong && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-white/40 hover:text-white/60 text-xs mt-1 font-semibold uppercase tracking-wide transition-colors"
                >
                  {expanded ? 'Less' : 'More'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Download progress bar ── */}
      {dlProgress && (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Loader2 size={12} className="animate-spin" />
            Downloading {dlProgress.done}/{dlProgress.total}…
          </div>
        </div>
      )}

      {/* ── Tracklist ── */}
      <div className="pb-32">
        {/* Column header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 mb-1">
          <span className="w-7 text-center text-[11px] text-white/25">#</span>
          <span className="flex-1 text-[11px] text-white/25 uppercase tracking-wider">Title</span>
        </div>

        {songs.map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            index={i}
            queue={songs}
            variant="album"
            onOptions={setOptionsSong}
          />
        ))}

        {songs.length === 0 && (
          <p className="text-white/30 text-sm text-center py-12">No tracks available</p>
        )}
      </div>

      {/* ── Song options bottom sheet ── */}
      <SongOptionsSheet song={optionsSong} onClose={() => setOptionsSong(null)} />
    </div>
  );
}
