import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { TLeafletMapProps, TMapUpdaterProps } from "./LeafletMap.type";

function MapUpdater({ lat, lng }: TMapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1.5 });
  }, [map, lat, lng]);

  return null;
}

export function LeafletMap({ lat, lng, label }: TLeafletMapProps) {
  return (
    <div
      className={`
        overflow-hidden
        border border-[var(--color-border)]
        rounded-[var(--radius-lg)] 
        shadow-md
      `}
    >
      <MapContainer center={[lat, lng]} zoom={10} className="w-full h-[400px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>{label && <Popup>{label}</Popup>}</Marker>
        <MapUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
