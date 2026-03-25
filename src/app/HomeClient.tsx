'use client';

import ScrollRow from '@/components/ui/ScrollRow';
import SongCard from '@/components/ui/SongCard';
import ArtistCard from '@/components/ui/ArtistCard';
import HeroBanner from '@/components/ui/HeroBanner';
import MadeForYou from '@/components/ui/MadeForYou';
import type { HomeData, Song, Album, LanguageSection } from '@/lib/types';
import { getImageUrl } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface HomeClientProps {
  data: HomeData;
  username: string;
  newReleases: Album[];
}

function renderSection(section: LanguageSection) {
  if (section.language === 'english' && section.rapSongs !== undefined) {
    const rapSongs  = section.rapSongs ?? [];
    const popSongs  = section.popSongs ?? [];
    const rapAlbums = section.rapAlbums ?? [];
    const popAlbums = section.popAlbums ?? [];

    return (
      <div key="english" className="space-y-8">
        {rapSongs.length > 0 && (
          <ScrollRow title="🎤 Rap & Hip Hop">
            {rapSongs.map((song) => (
              <div key={song.id} className="shrink-0 w-40 md:w-44">
                <SongCard item={song} type="song" queue={rapSongs} />
              </div>
            ))}
          </ScrollRow>
        )}
        {rapAlbums.length > 0 && (
          <ScrollRow title="🔊 Hip Hop Albums">
            {rapAlbums.map((album) => (
              <div key={album.id} className="shrink-0 w-40 md:w-44">
                <SongCard item={album} type="album" />
              </div>
            ))}
          </ScrollRow>
        )}
        {popSongs.length > 0 && (
          <ScrollRow title="🎵 Pop Hits">
            {popSongs.map((song) => (
              <div key={song.id} className="shrink-0 w-40 md:w-44">
                <SongCard item={song} type="song" queue={popSongs} />
              </div>
            ))}
          </ScrollRow>
        )}
        {popAlbums.length > 0 && (
          <ScrollRow title="💿 Pop Albums">
            {popAlbums.map((album) => (
              <div key={album.id} className="shrink-0 w-40 md:w-44">
                <SongCard item={album} type="album" />
              </div>
            ))}
          </ScrollRow>
        )}
      </div>
    );
  }

  // Generic (non-English) section
  return (
    <div key={section.language} className="space-y-8">
      {section.songs.length > 0 && (
        <ScrollRow title={`${section.label} Songs`}>
          {section.songs.map((song) => (
            <div key={song.id} className="shrink-0 w-40 md:w-44">
              <SongCard item={song} type="song" queue={section.songs as Song[]} />
            </div>
          ))}
        </ScrollRow>
      )}
      {section.albums.length > 0 && (
        <ScrollRow title={`${section.label} Albums`}>
          {section.albums.map((album) => (
            <div key={album.id} className="shrink-0 w-40 md:w-44">
              <SongCard item={album} type="album" />
            </div>
          ))}
        </ScrollRow>
      )}
    </div>
  );
}

export default function HomeClient({ data, username, newReleases }: HomeClientProps) {
  const { sections, topArtists, featuredPlaylists } = data;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="px-6 pb-8 space-y-10">
      {/* Greeting */}
      <div className="pt-6">
        <h1 className="text-white text-3xl font-bold">
          {greeting()}{username ? `, ${username}` : ''}
        </h1>
        <p className="text-white/40 text-sm mt-1">What would you like to listen to?</p>
      </div>

      {/* New Releases row */}
      {newReleases.length > 0 && (
        <ScrollRow title="New Releases 🆕">
          {newReleases.map((album) => (
            <div key={album.id} className="shrink-0 w-40 md:w-44">
              <SongCard item={album} type="album" />
            </div>
          ))}
        </ScrollRow>
      )}

      {/* Hero Banner */}
      {newReleases.length > 0 && <HeroBanner items={newReleases} />}

      {/* ── Made For You ── */}
      <MadeForYou username={username} />

      {/* Quick Playlists Grid */}
      {featuredPlaylists.length > 0 && (
        <section>
          <h2 className="text-white text-xl font-bold mb-4">Featured Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {featuredPlaylists.slice(0, 6).map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className="flex items-center gap-3 bg-[#1c1c1e] hover:bg-[#2c2c2e] rounded-xl overflow-hidden transition-colors"
              >
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src={getImageUrl(pl.image, '150x150')}
                    alt={pl.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <span className="text-sm font-medium text-white truncate pr-3">{pl.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Per-language sections */}
      {sections.map((section) => renderSection(section))}

      {/* Popular Artists */}
      {topArtists.length > 0 && (
        <ScrollRow title="Popular Artists">
          {topArtists.map((artist) => (
            <div key={artist.id} className="shrink-0 w-32 md:w-36">
              <ArtistCard artist={artist} />
            </div>
          ))}
        </ScrollRow>
      )}

      {/* Featured Playlists row */}
      {featuredPlaylists.length > 0 && (
        <ScrollRow title="Playlists">
          {featuredPlaylists.map((pl) => (
            <div key={pl.id} className="shrink-0 w-40 md:w-44">
              <SongCard item={pl} type="playlist" />
            </div>
          ))}
        </ScrollRow>
      )}

      {sections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-white/30">
          <p className="text-lg font-medium">No content found</p>
          <p className="text-sm mt-2">Try selecting different languages or genres</p>
        </div>
      )}
    </div>
  );
}
