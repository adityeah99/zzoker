'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import SongRow from '@/components/ui/SongRow';
import SongCard from '@/components/ui/SongCard';
import ScrollRow from '@/components/ui/ScrollRow';
import type { Artist } from '@/lib/types';

interface Props {
  artist: Artist;
}

export default function ArtistPageClient({ artist }: Props) {
  const { playSong } = usePlayer();
  const topSongs = artist.topSongs || [];
  const topAlbums = artist.topAlbums || [];
  const similarArtists = artist.similarArtists || [];
  const heroImage = getImageUrl(artist.image, '500x500');

  const handlePlay = () => {
    if (topSongs.length > 0) playSong(topSongs[0], topSongs);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 md:h-96">
        <Image
          src={heroImage}
          alt={artist.name}
          fill
          className="object-cover object-top"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <p className="text-white/60 text-sm font-medium mb-1">Artist</p>
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">{artist.name}</h1>
          {artist.followerCount && (
            <p className="text-white/50 text-sm mb-4">
              {artist.followerCount.toLocaleString()} followers
            </p>
          )}
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            <Play size={18} fill="white" />
            Play
          </button>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10">
        {/* Top Songs */}
        {topSongs.length > 0 && (
          <section>
            <h2 className="text-white text-xl font-bold mb-4">Popular Songs</h2>
            <div className="space-y-0.5">
              {topSongs.slice(0, 10).map((song, i) => (
                <SongRow key={song.id} song={song} index={i} queue={topSongs} showAlbum />
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {topAlbums.length > 0 && (
          <ScrollRow title="Albums">
            {topAlbums.map((album) => (
              <div key={album.id} className="shrink-0 w-40 md:w-44">
                <SongCard item={album} type="album" />
              </div>
            ))}
          </ScrollRow>
        )}

        {/* Similar Artists */}
        {similarArtists.length > 0 && (
          <ScrollRow title="Similar Artists">
            {similarArtists.slice(0, 10).map((a) => (
              <div key={a.id} className="shrink-0 w-36">
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden">
                    <Image
                      src={getImageUrl(a.image)}
                      alt={a.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                  <p className="text-sm text-white text-center truncate w-full">{a.name}</p>
                </div>
              </div>
            ))}
          </ScrollRow>
        )}

        {/* Bio */}
        {artist.bio && (
          <section>
            <h2 className="text-white text-xl font-bold mb-4">About</h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-2xl">{artist.bio}</p>
          </section>
        )}
      </div>
    </div>
  );
}
