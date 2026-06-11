import { NextRequest, NextResponse } from 'next/server';

// ─── GET: Fetch Bilibili video info by BV number ──────────────────
// Proxies the public Bilibili API to avoid CORS issues from the browser.
// Returns title, cover image URL, and stats.

export async function GET(request: NextRequest) {
  try {
    const bvid = request.nextUrl.searchParams.get('bvid');

    if (!bvid || !/^BV[a-zA-Z0-9]{10,12}$/.test(bvid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid BV number format' },
        { status: 400 },
      );
    }

    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com',
        },
        next: { revalidate: 3600 }, // cache for 1 hour
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Bilibili API returned ${res.status}` },
        { status: 502 },
      );
    }

    const json = await res.json();

    if (json.code !== 0 || !json.data) {
      return NextResponse.json(
        { success: false, error: json.message || 'Bilibili API error' },
        { status: 502 },
      );
    }

    const { title, pic, stat } = json.data;

    return NextResponse.json({
      success: true,
      data: {
        title: title || '',
        cover: pic || '',
        views: stat?.view || 0,
        likes: stat?.like || 0,
      },
    });
  } catch (error) {
    console.error('[BilibiliAPI] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Bilibili video info' },
      { status: 500 },
    );
  }
}