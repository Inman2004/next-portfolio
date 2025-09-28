import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      // Support sendBeacon with Blob (treated as octet-stream)
      const text = await req.text();
      try { body = JSON.parse(text); } catch { body = {}; }
    }

    const { fromPostId, toPostId, ts } = body || {};
    if (!fromPostId || !toPostId) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const ua = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';

    await db.collection('analyticsRelatedClicks').add({
      fromPostId,
      toPostId,
      ts: ts && Number.isFinite(ts) ? ts : Date.now(),
      ua,
      referer,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('related-click analytics error:', e);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
