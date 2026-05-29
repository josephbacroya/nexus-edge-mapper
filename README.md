# Nexus-Edge Mapper

A cyberpunk-inspired real-time geospatial telemetry dashboard demonstrating advanced computer engineering concepts including edge computing, binary stream processing, and low-overhead networking.

## Tech Stack
- Next.js 14+ (App Router)
- React, Tailwind CSS
- React-Leaflet
- Lucide Icons
- Node.js / Vercel Edge compatible APIs

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Start the telemetry stream pipeline in another terminal:
```bash
py pipeline.py
```

## Architecture
- **POST `/api/stream-event`**: Receives low-level binary payload (10 bytes), unpacks and parses it, then stores in an in-memory data store.
- **GET `/api/stream-event`**: Provides the latest telemetry point.
- **`pipeline.py`**: A python ingestion node fetching NASA EONET data, packing it strictly to 10 bytes using Big-Endian formatting (`!Hff`), and streaming it over HTTP.

## UI/UX
Features a "Cyber Grid Mission Control" visual aesthetic modeled after space telemetry centers and military command systems.
