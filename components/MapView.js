'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// handles smooth map flying
function MapController({ center, isFollowing }) {
  const map = useMap();
  useEffect(() => {
    if (!isFollowing) {
      // let user explore manually
      return;
    } else if (center && center[0] !== 0 && center[1] !== 0) {
      // fly to new event
      map.flyTo(center, 5, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center, isFollowing, map]);
  return null;
}

// grabs map instance for click controls
function MapEventCapture({ setMapInstance }) {
  const map = useMap();
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
}

// reverse geocode coords to city/country
function ReverseGeocode({ lat, lng }) {
  const [location, setLocation] = useState('Locating...');

  useEffect(() => {
    let isMounted = true;
    const fetchLocation = async () => {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await res.json();
        if (isMounted) {
          const city = data.city || data.locality || data.principalSubdivision || 'Unknown Region';
          const country = data.countryName || 'Unknown Country';
          setLocation(`${city}, ${country}`);
        }
      } catch (err) {
        if (isMounted) setLocation('Location unavailable');
      }
    };
    fetchLocation();
    return () => { isMounted = false; };
  }, [lat, lng]);

  return <span>{location}</span>;
}

// auto-open popup for selected marker
function SelectedMarker({ event, color, createPulseIcon, handleMarkerClick }) {
  const markerRef = React.useRef(null);
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, []);

  return (
    <Marker
      position={[event.lat, event.lng]}
      icon={createPulseIcon(color)}
      eventHandlers={{ click: () => handleMarkerClick(event) }}
      ref={markerRef}
    >
      <Popup className="cyber-popup" closeButton={false}>
        <div className="font-mono text-sm p-1 text-gray-800">
          <strong style={{ color }}>Event ID:</strong> {event.id}<br />
          <strong style={{ color }}>Category:</strong> {event.category}<br />
          <strong style={{ color }}>Location:</strong> <ReverseGeocode lat={event.lat} lng={event.lng} /><br />
          <strong style={{ color }}>Coordinates:</strong> [{event.lat}, {event.lng}]
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapView({ eventsList = [], activeFilter = 'All', isFollowing = true, setIsFollowing }) {
  const defaultCenter = [0, 0];
  const defaultZoom = 2;

  const [position, setPosition] = useState(defaultCenter);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const handleMarkerClick = (event) => {
    if (selectedEventId === event.id) {
      // deselect on click
      setSelectedEventId(null);
      if (mapInstance) {
        mapInstance.flyTo(defaultCenter, defaultZoom, { animate: true, duration: 1.5 });
      }
    } else {
      // select and fly to node
      setSelectedEventId(event.id);
      if (setIsFollowing) setIsFollowing(false);
      if (mapInstance) {
        mapInstance.flyTo([event.lat, event.lng], 5, { animate: true, duration: 1.5 });
      }
    }
  };

  const visibleEvents = activeFilter === 'All'
    ? eventsList
    : eventsList.filter(e => e.category === activeFilter);

  const latestVisibleEvent = visibleEvents[visibleEvents.length - 1];

  useEffect(() => {
    if (latestVisibleEvent && latestVisibleEvent.lat && latestVisibleEvent.lng) {
      setPosition([latestVisibleEvent.lat, latestVisibleEvent.lng]);
    }
  }, [latestVisibleEvent]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Wildfires': return '#ef4444'; // Red
      case 'Severe Storms': return '#06b6d4'; // Cyan
      case 'Volcanoes': return '#f59e0b'; // Amber
      case 'Earthquakes': return '#a855f7'; // Purple
      default: return '#CFFFE2'; // Mint
    }
  };

  const createPulseIcon = (color) => {
    return L.divIcon({
      className: 'custom-pulse-icon',
      html: `<div style="background-color: ${color}; box-shadow: 0 0 15px ${color};" class="pulse-dot">
               <div style="border-color: ${color};" class="pulse-ring"></div>
             </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        <MapEventCapture setMapInstance={setMapInstance} />
        <MapController center={position} isFollowing={isFollowing} />

        {visibleEvents.map((event, idx) => {
          const color = getCategoryColor(event.category);
          const isSelected = event.id === selectedEventId;
          return (
            <React.Fragment key={`${event.id}-${idx}`}>
              {/* using html marker here to fix leaflet svg transform bugs */}
              {isSelected ? (
                <SelectedMarker
                  event={event}
                  color={color}
                  createPulseIcon={createPulseIcon}
                  handleMarkerClick={handleMarkerClick}
                />
              ) : (
                <CircleMarker
                  center={[event.lat, event.lng]}
                  radius={7}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.5,
                    weight: 1.5,
                  }}
                  eventHandlers={{ click: () => handleMarkerClick(event) }}
                >
                  <Popup className="cyber-popup">
                    <div className="font-mono text-sm p-1 text-gray-800">
                      <strong style={{ color }}>Event ID:</strong> {event.id}<br />
                      <strong style={{ color }}>Category:</strong> {event.category}<br />
                      <strong style={{ color }}>Location:</strong> <ReverseGeocode lat={event.lat} lng={event.lng} /><br />
                      <strong style={{ color }}>Coordinates:</strong> [{event.lat}, {event.lng}]
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
