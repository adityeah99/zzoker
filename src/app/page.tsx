'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getHomeData } from '@/lib/api';
import HomeClient from './HomeClient';
import TopBar from '@/components/layout/TopBar';
import GenreFilter, { type Genre, type EnglishSubFilter } from '@/components/ui/GenreFilter';
import UsernameModal from '@/components/ui/UsernameModal';
import type { HomeData } from '@/lib/types';
import { ScrollRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { useLanguage } from '@/hooks/useLanguage';

export default function HomePage() {
  const { languages, mounted } = useLanguage();
  const [genre, setGenre] = useState<Genre>('All');
  const [englishSubFilter, setEnglishSubFilter] = useState<EnglishSubFilter>('All English');
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsernameState] = useState('');
  const prevKey = useRef('');

  const fetchData = (langs: string[], g: Genre) => {
    const key = langs.join(',') + '|' + g;
    if (key === prevKey.current) return;
    prevKey.current = key;
    setLoading(true);
    setError(null);
    getHomeData(langs, g)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!mounted) return;
    fetchData(languages, genre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages, genre, mounted]);

  const handleUsernameDone = useCallback((name: string) => {
    setUsernameState(name);
  }, []);

  return (
    <div>
      {/* First-visit username modal */}
      <UsernameModal onDone={handleUsernameDone} />

      <TopBar />
      <GenreFilter
        active={genre}
        onChange={setGenre}
        isEnglishActive={languages.includes('english')}
        activeEnglishSub={englishSubFilter}
        onEnglishSubChange={setEnglishSubFilter}
      />

      {loading ? (
        <div className="px-6 pt-4 pb-8 space-y-10">
          <div>
            <div className="h-9 w-52 bg-white/10 rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-72 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="w-full h-72 md:h-96 rounded-2xl bg-white/5 animate-pulse" />
          {/* Made For You skeleton */}
          <ScrollRowSkeleton count={4} />
          <ScrollRowSkeleton count={6} />
          <ScrollRowSkeleton count={6} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-white/30">
          <p className="text-lg font-medium">Could not load content</p>
          <p className="text-sm mt-2 text-red-400/60">{error}</p>
          <button
            onClick={() => { prevKey.current = ''; fetchData(languages, genre); }}
            className="mt-6 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <HomeClient data={data} username={username} englishSubFilter={englishSubFilter} />
      ) : null}
    </div>
  );
}
