import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { TLeafletMapProps, TMapUpdaterProps } from "./LeafletMap.type";

function MapUpdater({ lat, lng }: TMapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1.5 });
  }, [map, lat, lng]);

  return null;
}

export function LeafletMap({ lat, lng, label, onMapClick, className = "" }: TLeafletMapProps) {
  const safeOnMapClick = onMapClick as (lat: number, lng: number) => void;

  function MapClickHandler() {
    useMapEvents({
      click: (event: LeafletMouseEvent) => {
        safeOnMapClick(event.latlng.lat, event.latlng.lng);
      },
    });

    return null;
  }

  return (
    <div
      className={`
        relative z-0
        overflow-hidden
        border border-[var(--color-border)]
        rounded-[var(--radius-lg)] 
        shadow-md
        ${className}
      `}
    >
      <MapContainer center={[lat, lng]} zoom={10} className="w-full h-[400px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>{label && <Popup>{label}</Popup>}</Marker>
        <MapUpdater lat={lat} lng={lng} />
        <MapClickHandler />
      </MapContainer>
    </div>
  );
}
