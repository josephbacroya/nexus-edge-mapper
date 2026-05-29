import requests
import struct
import time
import random
import re

EONET_API_BASE = "https://eonet.gsfc.nasa.gov/api/v3/events"
EDGE_ENDPOINT = "http://localhost:3000/api/stream-event"

def generate_event_id(raw_id, event_categories):
    # Hash or regex the ID to a 12-bit int (max 4095)
    # EONET IDs often look like "WILD-US-2024-1234". We must use the LAST number (e.g. 1234), not the first (2024)
    numbers = re.findall(r'\d+', raw_id)
    base_id = int(numbers[-1]) % 4096 if numbers else hash(raw_id) % 4096
    
    # Map category to 4-bit integer
    cat_id = 4 # default 'other'
    if event_categories:
        cat_str = event_categories[0].get('id', '').lower()
        if 'wildfire' in cat_str: cat_id = 1
        elif 'storm' in cat_str: cat_id = 2
        elif 'volcano' in cat_str: cat_id = 3
        elif 'earthquake' in cat_str: cat_id = 4
        
    # Bitwise pack: (4-bit category << 12) | 12-bit ID
    return (cat_id << 12) | base_id

def fetch_events(categories="wildfires,severeStorms,volcanoes,earthquakes", days=30):
    """
    Fetches events from the NASA EONET API using standard query parameters.
    Based on the EONET documentation:
    - limit: maximum number of events to return
    - days: lookback period for active events
    - category: comma-separated list of categories to filter
    """
    params = {
        'status': 'open',
        'limit': 50,
        'days': days,
        'category': categories
    }
    try:
        print(f"[FETCH] Querying NASA EONET: categories={categories}, days={days}")
        response = requests.get(EONET_API_BASE, params=params, timeout=10)
        response.raise_for_status()
        events = response.json().get('events', [])
        print(f"[SYS] Fetched {len(events)} active events.")
        return events
    except Exception as e:
        print(f"[ERROR] Failed to fetch from EONET: {e}")
        return []

def main():
    print("[SYS] Initializing EONET telemetry pipeline...")
    
    while True:
        events = fetch_events()
        
        if not events:
            print("[WARN] No events found, retrying in 5 seconds...")
            time.sleep(5)
            continue
            
        # Shuffle events to simulate real-time random stream
        random.shuffle(events)
        
        for event in events:
            raw_id = event.get('id', '0')
            event_id = generate_event_id(raw_id, event.get('categories', []))
            
            # EONET coordinates are [longitude, latitude]
            geometries = event.get('geometry', [])
            if not geometries:
                continue
                
            geom = geometries[0]
            coords = geom.get('coordinates', [0, 0])
            if len(coords) < 2:
                continue
                
            lng, lat = coords[0], coords[1]
            
            # Serialize packet
            # !Hff => Network Byte Order, Unsigned Short (2 bytes), Float (4 bytes), Float (4 bytes)
            # Total packet size: 10 bytes
            try:
                packet = struct.pack("!Hff", event_id, lat, lng)
                
                print(f"[PACK] Event {event_id} serialized into {len(packet)} bytes")
                print(f"[POST] Streaming binary payload to edge endpoint...")
                
                # POST raw bytes directly to endpoint
                res = requests.post(
                    EDGE_ENDPOINT, 
                    data=packet, 
                    headers={'Content-Type': 'application/octet-stream'},
                    timeout=5
                )
                
                if res.status_code == 200:
                    print(f"[OK] Packet transmitted successfully.")
                    print(f"       => Lat: {lat:.4f}, Lng: {lng:.4f}\n")
                else:
                    print(f"[ERROR] Edge rejected packet: {res.status_code} - {res.text}\n")
                    
            except struct.error as e:
                print(f"[ERROR] Serialization failed: {e}")
            except Exception as e:
                print(f"[ERROR] Transmission failed: {e}")
                
            # Simulate streaming delay between 2 and 5 seconds
            time.sleep(random.uniform(2.0, 5.0))

if __name__ == "__main__":
    main()
