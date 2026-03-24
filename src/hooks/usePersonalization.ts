'use client';

import { useState, useEffect } from 'react';
import { searchSongs, getArtistSongs, getImageUrl } from '@/lib/api';
import type { Song } from '@/lib/types';

export interface HistoryEntry {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  language: string;
  timestamp: number;
}

export interface DailyMix {
  id: string;
  label: string;          // "Daily Mix 1"
  number: string;         // "01"
  color: string;          // badge accent color
  coverImage: string;     // URL for card background
  artistNames: string;    // "Anirudh, Arijit and more"
  songs: Song[];
}

const MIX_COLORS = ['#fc3c44', '#f5c518', '#1db954', '#e91e8c'];

// Fallback seeds when user has no history
const FALLBACK_QUERIES = [
  { q: 'anirudh ravichander tamil hits',    label: 'Tamil Favourites' },
  { q: 'arijit singh hindi romantic songs', label: 'Hindi Hits'        },
  { q: 'ar rahman classic songs',           label: 'Classic Mix'       },
  { q: 'trending indie songs 2025',         label: 'Discover'          },
];

function topN<T extends string>(arr: T[], n: number): T[] {
  const freq: Record<string, number> = {};
  for (const v of arr) if (v) freq[v] = (freq[v] ?? 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k as T);
}

async function buildMix(
  idx: number,
  query: string,
  label: string,
  useArtistEndpoint?: { artistId: string },
): Promise<DailyMix> {
  let songs: Song[] = [];
  try {
    if (useArtistEndpoint?.artistId) {
      const res = await getArtistSongs(useArtistEndpoint.artistId, 0, 'popularity', 'desc');
      songs = res.results ?? [];
    }
    if (songs.length < 5) {
      const res = await searchSongs(query, 0, 20);
      songs = [...songs, ...res.results].slice(0, 20);
    }
  } catch { /* stay empty */ }

  // Deduplicate by id
  const seen = new Set<string>();
  songs = songs.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });

  const coverImage = getImageUrl(songs[0]?.image, '500x500');
  const nameSet = new Set(songs.slice(0, 4).flatMap((s) => s.artists?.primary?.map((a) => a.name) ?? []));
  const names = Array.from(nameSet);
  const artistNames = names.length > 3
    ? `${names.slice(0, 3).join(', ')} and more`
    : names.join(', ');

  return {
    id: `mix-${idx}`,
    label,
    number: String(idx + 1).padStart(2, '0'),
    color: MIX_COLORS[idx % MIX_COLORS.length],
    coverImage,
    artistNames,
    songs,
  };
}

export function usePersonalization() {
  const [dailyMixes, setDailyMixes] = useState<DailyMix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function compute() {
      setLoading(true);
      try {
        const raw: HistoryEntry[] = JSON.parse(localStorage.getItem('listening_history') || '[]');
        const hasHistory = raw.length >= 3;

        let mixDefs: { query: string; label: string; artistId?: string }[];

        if (hasHistory) {
          const topArtistIds = topN(raw.map((e) => e.artistId), 4);
          const topArtistNames = topN(raw.map((e) => e.artist), 4);
          const topLang = topN(raw.map((e) => e.language), 1)[0] ?? 'hindi';

          mixDefs = [
            {
              query: `${topArtistNames[0]} songs`,
              label: 'Daily Mix 1',
              artistId: topArtistIds[0],
            },
            {
              query: topArtistNames[1] ? `${topArtistNames[1]} songs` : 'hindi hits 2025',
              label: 'Daily Mix 2',
              artistId: topArtistIds[1],
            },
            {
              query: `${topLang} hits 2025`,
              label: `${topLang.charAt(0).toUpperCase() + topLang.slice(1)} Mix`,
            },
            {
              query: 'new indie trending songs 2025',
              label: 'Discover',
            },
          ];
        } else {
          // No history — use curated fallbacks
          mixDefs = FALLBACK_QUERIES.map(({ q, label }) => ({ query: q, label }));
        }

        const mixes = await Promise.all(
          mixDefs.map((def, i) =>
            buildMix(i, def.query, def.label, def.artistId ? { artistId: def.artistId } : undefined)
          )
        );

        if (!cancelled) setDailyMixes(mixes.filter((m) => m.songs.length > 0));
      } catch (e) {
        console.warn('Personalization error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    compute();
    return () => { cancelled = true; };
  }, []);

  return { dailyMixes, loading };
}

export function getUsername(): string {
  if (typeof window === 'undefined') return 'You';
  return localStorage.getItem('user_name') || '';
}

export function setUsername(name: string) {
  localStorage.setItem('user_name', name.trim() || 'You');
}
