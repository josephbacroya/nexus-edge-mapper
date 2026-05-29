# Nexus-Edge Mapper

A cyberpunk-inspired real-time geospatial telemetry dashboard demonstrating advanced computer engineering concepts including edge computing, binary stream processing, and low-overhead networking.

created by : Joseph Bacroya - 4th Year Computer Engineering Student from University of Batangas Lipa City

## Tech Stack

- Framework: Next.js 14+ (App Router)

- Styling: Tailwind CSS (Custom Cyber-Grid Aesthetic)

- Geospatial: React-Leaflet, CARTO Dark Matter API

- Icons: Lucide React

- Data Persistence: Upstash Redis (Rolling Buffer Pattern)

- Networking: Vercel Edge Runtime / Node.js

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
py pipeline.py / python pipeline.py
```

## Architecture
- **POST `/api/stream-event`**: Receives binary payloads, executes custom unpack logic, and utilizes Redis LPUSH/LTRIM commands to maintain a stable, 50-event rolling buffer.
- **GET `/api/stream-event`**: Fetches the current event cluster via LRANGE, providing the frontend with a synchronized state matrix.
- **`pipeline.py`**: Queries the NASA EONET API, serializes coordinate/event data into a compact 10-byte Big-Endian binary format (!Hff), and streams the packets via HTTP POST.

## UI/UX

- Features a "Cyber Grid Mission Control" visual aesthetic modeled after space telemetry centers.

- Geospatial Engine: Employs memoized marker rendering (React.memo) to prevent DOM thrashing during high-frequency telemetry updates.

- Camera Control: Implements a debounced, auto-follow system with interaction-locking, ensuring smooth flight-path transitions between new event clusters.

- Diagnostics: Integrated terminal emulator provides real-time feedback on stream ingestion and coordinate re-indexing.
