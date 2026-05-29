import { NextResponse } from 'next/server';
import { parseBinaryPacket } from '@/lib/packetParser';
import { setLatestEvent, getLatestEvent } from '@/lib/telemetryStore';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    if (contentType !== 'application/octet-stream') {
      return NextResponse.json({ error: 'Invalid Content-Type. Expected application/octet-stream' }, { status: 400 });
    }

    const arrayBuffer = await request.arrayBuffer();
    
    // Parse binary telemetry
    const parsedEvent = parseBinaryPacket(arrayBuffer);
    
    // Store in our temporary global store (mocking a Redis stream)
    setLatestEvent(parsedEvent);
    
    console.log(`[EDGE INGEST] Parsed event ${parsedEvent.id} at [${parsedEvent.lat}, ${parsedEvent.lng}]`);

    return NextResponse.json({ success: true, event: parsedEvent }, { status: 200 });

  } catch (error) {
    console.error('[EDGE INGEST ERROR]', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  const latest = getLatestEvent();
  if (!latest) {
    return NextResponse.json({ error: 'No telemetry data available', event: null }, { status: 200 });
  }
  
  return NextResponse.json({ event: latest }, { status: 200 });
}
