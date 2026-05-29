import requests
import struct
import time
import random
import re
import threading
import os
from flask import Flask

# 1. Initialize a tiny Flask server to satisfy cloud health checks
app = Flask(__name__)

EONET_API_BASE = "https://eonet.gsfc.nasa.gov/api/v3/events"
EDGE_ENDPOINT = "https://nexus-edge-mapper-wu5e.vercel.app/api/stream-event"

@app.route('/')
def home():
    return {"status": "Telemetry node online", "target": EDGE_ENDPOINT}, 200

def generate_event_id(raw_id, event_categories):
    numbers = re.findall(r'\d+', raw_id)
    base_id = int(numbers[-1]) % 4096 if numbers else hash(raw_id) % 4096
    
    cat_id = 4 
    if event_categories:
        cat_str = event_categories[0].get('id', '').lower()
        if 'wildfire' in cat_str: cat_id = 1
        elif 'storm' in cat_str: cat_id = 2
        elif 'volcano' in cat_str: cat_id = 3
        elif 'earthquake' in cat_str: cat_id = 4
        
    return (cat_id << 12) | base_id

def fetch_events(categories="wildfires,severeStorms,volcanoes,earthquakes", days=30):
    params = {
        'status': 'open',
        'limit': 50,
        'days': days,
        'category': categories
    }
    try:
        print(f"[FETCH] Querying NASA EONET...")
        response = requests.get(EONET_API_BASE, params=params, timeout=10)
        response.raise_for_status()
        events = response.json().get('events', [])
        return events
    except Exception as e:
        print(f"[ERROR] Failed to fetch from EONET: {e}")
        return []

# 2. This runs your original loop continuously in a background thread
def telemetry_stream_worker():
    print("[SYS] Background telemetry worker ignited.")
    while True:
        events = fetch_events()
        if not events:
            time.sleep(5)
            continue
            
        random.shuffle(events)
        
        for event in events:
            raw_id = event.get('id', '0')
            event_id = generate_event_id(raw_id, event.get('categories', []))
            geometries = event.get('geometry', [])
            if not geometries: continue
                
            geom = geometries[0]
            coords = geom.get('coordinates', [0, 0])
            if len(coords) < 2: continue
                
            lng, lat = coords[0], coords[1]
            
            try:
                packet = struct.pack("!Hff", event_id, lat, lng)
                res = requests.post(
                    EDGE_ENDPOINT, 
                    data=packet, 
                    headers={'Content-Type': 'application/octet-stream'},
                    timeout=5
                )
                if res.status_code == 200:
                    print(f"[OK] Streamed Event {event_id} => Lat: {lat:.4f}, Lng: {lng:.4f}")
                else:
                    print(f"[ERROR] Edge rejected packet: {res.status_code}")
                    
            except Exception as e:
                print(f"[ERROR] Transmission failure: {e}")
                
            time.sleep(random.uniform(2.0, 5.0))

if __name__ == "__main__":
    # 3. Fire up the data loop asynchronously
    threading.Thread(target=telemetry_stream_worker, daemon=True).start()
    
    # 4. Bind to the dynamic environment port assigned by Render
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)