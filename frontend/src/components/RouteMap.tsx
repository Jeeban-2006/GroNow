"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const storeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3734/3734030.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

export default function RouteMap({ waypoints, riderLocation, lightMode = false }: { waypoints: any[], riderLocation?: {lat: number, lng: number}, lightMode?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={`h-full w-full ${lightMode ? 'bg-gray-100' : 'bg-[#1A1A18]'} animate-pulse flex items-center justify-center font-bold text-xs ${lightMode ? 'text-green-600' : 'text-gronow-turmeric'}`}>INITIALIZING MAP...</div>;

  if (!waypoints || waypoints.length === 0) {
    return <div className={`h-full w-full ${lightMode ? 'bg-gray-100' : 'bg-[#1A1A18]'} flex items-center justify-center font-bold text-xs text-gray-500`}>NO ROUTE DATA AVAILABLE</div>;
  }

  // Filter out invalid waypoints
  const validWaypoints = waypoints.filter(wp => wp && wp.lat != null && wp.lng != null && !isNaN(wp.lat) && !isNaN(wp.lng));

  if (validWaypoints.length === 0) {
    return <div className={`h-full w-full ${lightMode ? 'bg-gray-100' : 'bg-[#1A1A18]'} flex items-center justify-center font-bold text-xs text-gray-500`}>INVALID ROUTE DATA</div>;
  }

  // Calculate center based on first valid waypoint
  const center = [validWaypoints[0].lat, validWaypoints[0].lng] as [number, number];

  // Polyline positions (Sequence: Rider -> Stores -> Customer)
  const linePositions = [];
  if (riderLocation && !isNaN(riderLocation.lat) && !isNaN(riderLocation.lng)) {
    linePositions.push([riderLocation.lat, riderLocation.lng]);
  }
  
  validWaypoints.forEach(wp => {
    linePositions.push([wp.lat, wp.lng]);
  });

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      {/* Maps tile layer */}
      <TileLayer
        url={lightMode ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Rider Marker */}
      {riderLocation && (
        <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
          <Popup className="font-mono">Rider Current Location</Popup>
        </Marker>
      )}

      {/* Waypoint Markers */}
      {validWaypoints.map((wp, i) => (
        <Marker key={i} position={[wp.lat, wp.lng]} icon={wp.type === 'pickup' ? storeIcon : customerIcon}>
          <Popup className="font-mono text-black">
            <strong>{wp.type === 'pickup' ? 'PICKUP' : 'DROPOFF'}</strong><br/>
            {wp.name}
          </Popup>
        </Marker>
      ))}

      {/* Polyline Route */}
      <Polyline positions={linePositions as [number, number][]} color={lightMode ? "#16a34a" : "#FFC800"} weight={5} dashArray={lightMode ? "none" : "10, 10"} />
    </MapContainer>
  );
}
