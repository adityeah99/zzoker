import { NextRequest, NextResponse } from 'next/server';

// Proxy route — bypasses CORS on JioSaavn audio CDN URLs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') ?? 'song.mp3';

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  // Only allow saavn CDN URLs
  const allowed = ['aac.saavncdn.com', 'c.saavncdn.com'];
  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }
  if (!allowed.some((h) => hostname.endsWith(h))) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  const upstream = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502 });
  }

  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
    },
  });
}
