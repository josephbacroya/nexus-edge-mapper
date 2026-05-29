import { NextResponse } from 'next/server';
import { parseBinaryPacket } from '@/lib/packetParser';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis using safe environment variables
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

    // Store directly into Upstash Redis (it handles objects automatically)
    await redis.set('latest_event', parsedEvent);

    console.log(`[EDGE INGEST] Parsed and cached event ${parsedEvent.id} at [${parsedEvent.lat}, ${parsedEvent.lng}]`);

    return NextResponse.json({ success: true, event: parsedEvent }, { status: 200 });

  } catch (error) {
    console.error('[EDGE INGEST ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    // Fetch the latest global packet coordinate state from the cloud cache
    const latest = await redis.get('latest_event');

    if (!latest) {
      return NextResponse.json({ error: 'No telemetry data available', event: null }, { status: 200 });
    }

    return NextResponse.json({ event: latest }, { status: 200 });
  } catch (error) {
    console.error('[EDGE GET ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}