import { CELL_SIZE_OPTIONS } from "@/constants";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { TCellBoundsLayerProps, TLeafletMapProps, TMapUpdaterProps } from "./LeafletMap.type";

function MapUpdater({ lat, lng }: TMapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1.5 });
  }, [map, lat, lng]);

  return null;
}

function CellBoundsLayer({ cellBounds, gridSize }: TCellBoundsLayerProps) {
  const bounds: [[number, number], [number, number]] = [
    [cellBounds.south, cellBounds.west],
    [cellBounds.north, cellBounds.east],
  ];
  const areaMatch = gridSize ? /\(~[^)]+\)/.exec(CELL_SIZE_OPTIONS[gridSize]) : null;
  const area = areaMatch ? ` ${areaMatch[0]}` : "";
  const tooltipContent = `Grid cell: ${gridSize ?? ""}${area}`;

  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: "#1D9E75",
        weight: 1.5,
        fillColor: "#1D9E75",
        fillOpacity: 0.08,
        dashArray: "4 4",
      }}
    >
      <Tooltip sticky>{tooltipContent}</Tooltip>
    </Rectangle>
  );
}

export function LeafletMap({
  lat,
  lng,
  label,
  onMapClick,
  className = "",
  cellBounds,
  gridSize,
}: TLeafletMapProps) {
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
        {cellBounds && (
          <CellBoundsLayer cellBounds={cellBounds} {...(gridSize ? { gridSize } : {})} />
        )}
        <MapUpdater lat={lat} lng={lng} />
        <MapClickHandler />
      </MapContainer>
    </div>
  );
}
