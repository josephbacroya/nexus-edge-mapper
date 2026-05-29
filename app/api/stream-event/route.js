import { NextResponse } from 'next/server';
import { parseBinaryPacket } from '@/lib/packetParser';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    if (contentType !== 'application/octet-stream') {
      return NextResponse.json({ error: 'Invalid Content-Type. Expected application/octet-stream' }, { status: 400 });
    }

    const arrayBuffer = await request.arrayBuffer();

    // Parse binary telemetry using your custom unpack logic
    const parsedEvent = parseBinaryPacket(arrayBuffer);

    // Enrich with a fresh server-side ingestion timestamp
    const eventWithTimestamp = {
      ...parsedEvent,
      timestamp: new Date().toISOString()
    };

    // 1. LPUSH prepends the new event to the front of a list called 'telemetry_stream'
    await redis.lpush('telemetry_stream', JSON.stringify(eventWithTimestamp));

    // 2. LTRIM keeps only the 50 most recent entries so your database doesn't grow infinitely
    await redis.ltrim('telemetry_stream', 0, 49);

    console.log(`[EDGE INGEST] Buffered event ${parsedEvent.id} into rolling stream.`);
    return NextResponse.json({ success: true, event: eventWithTimestamp }, { status: 200 });

  } catch (error) {
    console.error('[EDGE INGEST ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    // 3. LRANGE fetches all items from index 0 to the end (-1)
    const listData = await redis.lrange('telemetry_stream', 0, -1);

    if (!listData || listData.length === 0) {
      return NextResponse.json({ error: 'No telemetry data available', events: [] }, { status: 200 });
    }

    // Safely parse the list elements back into JSON objects for the frontend
    const events = listData.map(item => typeof item === 'string' ? JSON.parse(item) : item);

    // Return the full array of active events to the frontend map dashboard
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('[EDGE GET ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}