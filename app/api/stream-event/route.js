import { NextResponse } from 'next/server';
import { parseBinaryPacket } from '@/lib/packetParser';
import { Redis } from '@upstash/redis';

// init upstash redis client
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

    // parse binary telemetry
    const parsedEvent = parseBinaryPacket(arrayBuffer);

    // add server-side timestamp
    const eventWithTimestamp = {
      ...parsedEvent,
      timestamp: new Date().toISOString()
    };

    // prepend new event to the stream
    await redis.lpush('telemetry_stream', JSON.stringify(eventWithTimestamp));

    // keep only the last 50 events
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
    // get all items from the stream
    const listData = await redis.lrange('telemetry_stream', 0, -1);

    if (!listData || listData.length === 0) {
      return NextResponse.json({ error: 'No telemetry data available', events: [] }, { status: 200 });
    }

    // parse items back to json
    const events = listData.map(item => typeof item === 'string' ? JSON.parse(item) : item);

    // return events for the map
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('[EDGE GET ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}