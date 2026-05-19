import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { TMiniMapLocation, TMiniMapProps } from "./MiniMap.type";

function MapController({ locations }: { locations: TMiniMapLocation[] }) {
  const map = useMap();
  const prevKey = useRef("");

  useEffect(() => {
    const key = locations.map((l) => `${l.lat},${l.lng}`).join("|");
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (locations.length === 0) return;
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 10);
    } else {
      const latLngs: [number, number][] = locations.map((loc) => [loc.lat, loc.lng]);
      map.fitBounds(latLngs, { padding: [24, 24] });
    }
  }, [map, locations]);

  return null;
}

export function MiniMap({ locations, activeIndex, onToggle }: TMiniMapProps) {
  if (locations.length === 0) return null;

  const showToggle = locations.length === 2;
  const initialCenter: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <div className="flex h-full flex-col">
      {showToggle && (
        <div className="shrink-0 flex justify-center border-b border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5">
          <div className="flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5">
            {locations.map((loc, i) => (
              <button
                key={loc.label}
                type="button"
                onClick={() => onToggle?.(i)}
                className={`rounded-full px-3 py-1 text-[length:var(--font-xs)] font-medium transition-colors duration-150 ${
                  activeIndex === i
                    ? "text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
                style={activeIndex === i ? { backgroundColor: loc.color } : undefined}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1">
        <MapContainer
          center={initialCenter}
          zoom={6}
          style={{ height: "100%" }}
          className="w-full"
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          keyboard={false}
          boxZoom={false}
          touchZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController locations={locations} />
          {locations.map((loc, i) => (
            <CircleMarker
              key={loc.label}
              center={[loc.lat, loc.lng]}
              radius={activeIndex === i ? 10 : 7}
              pathOptions={{
                color: loc.color,
                fillColor: loc.color,
                fillOpacity: 0.9,
                weight: 2,
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
