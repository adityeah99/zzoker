import type { Song } from './types';

export type DownloadQuality = '96kbps' | '160kbps' | '320kbps';

function sanitize(str: string): string {
  return str
    .replace(/[\\/:*?"<>|]/g, '')   // remove illegal filename chars
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export function getFilename(song: Song): string {
  const title = sanitize(song.name);
  const artist = sanitize(
    song.artists?.primary?.map((a) => a.name).join(', ') || 'Unknown Artist'
  );
  return `${title} - ${artist}.mp3`;
}

export function getUrlForQuality(
  downloadUrls: Song['downloadUrl'],
  quality: DownloadQuality,
): string {
  if (!downloadUrls || downloadUrls.length === 0) return '';
  // Try exact match, then fall back down
  const fallbacks: DownloadQuality[] = ['320kbps', '160kbps', '96kbps'];
  const start = fallbacks.indexOf(quality);
  for (let i = start; i < fallbacks.length; i++) {
    const match = downloadUrls.find((d) => d.quality === fallbacks[i]);
    if (match) return match.url;
  }
  return downloadUrls[downloadUrls.length - 1].url;
}

export async function downloadSong(
  song: Song,
  quality: DownloadQuality = '320kbps',
): Promise<void> {
  const rawUrl = getUrlForQuality(song.downloadUrl, quality);
  if (!rawUrl) throw new Error('No download URL available for this song');

  const filename = getFilename(song);

  // Route through our proxy to avoid CORS issues
  const proxyUrl = `/api/download?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(filename)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

export async function downloadAll(
  songs: Song[],
  quality: DownloadQuality = '320kbps',
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const valid = songs.filter(
    (s) => s.downloadUrl && s.downloadUrl.length > 0
  );

  for (let i = 0; i < valid.length; i++) {
    onProgress?.(i + 1, valid.length);
    try {
      await downloadSong(valid[i], quality);
    } catch (e) {
      console.warn(`Failed to download "${valid[i].name}":`, e);
    }
    if (i < valid.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  onProgress?.(valid.length, valid.length);
}
