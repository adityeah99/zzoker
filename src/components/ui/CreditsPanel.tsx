'use client';

import { useState, useEffect } from 'react';
import { getSongCredits, type CreditEntry } from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  singer: 'Vocals',
  music: 'Music',
  lyricist: 'Lyrics',
  producer: 'Producer',
  composer: 'Composer',
  primary_artist: 'Artist',
  featured_artist: 'Featuring',
  arranger: 'Arrangement',
};

function friendlyRole(role: string): string {
  const lower = role.toLowerCase().replace(/\s+/g, '_');
  return ROLE_LABELS[lower] ?? (role.charAt(0).toUpperCase() + role.slice(1));
}

function groupByRole(credits: CreditEntry[]): [string, string[]][] {
  const map = new Map<string, string[]>();
  for (const c of credits) {
    const key = c.role;
    if (!map.has(key)) map.set(key, []);
    const names = map.get(key)!;
    if (!names.includes(c.name)) names.push(c.name);
  }
  const result: [string, string[]][] = [];
  map.forEach((names, role) => result.push([role, names]));
  return result;
}

interface Props {
  songId: string;
}

const VISIBLE_ROLES = 4;

export default function CreditsPanel({ songId }: Props) {
  const [credits, setCredits] = useState<CreditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setExpanded(false);
    getSongCredits(songId)
      .then(setCredits)
      .finally(() => setLoading(false));
  }, [songId]);

  const grouped = groupByRole(credits);
  const visible = expanded ? grouped : grouped.slice(0, VISIBLE_ROLES);
  const hasMore = grouped.length > VISIBLE_ROLES;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-semibold">Credits</h3>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {expanded ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-2.5 w-14 bg-white/10 rounded animate-pulse" />
              <div className="h-3.5 w-32 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-white/30 text-xs">No credits available</p>
      ) : (
        <div className="space-y-3">
          {visible.map(([role, names]) => (
            <div key={role}>
              <p className="text-white/40 text-[11px] mb-0.5 uppercase tracking-wide">
                {friendlyRole(role)}
              </p>
              <p className="text-white text-sm font-medium leading-snug">
                {names.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
