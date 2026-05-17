import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { TMapFitterProps, TMapNavigatorProps } from "../HeatMap.type";

export function MapNavigator({ target }: TMapNavigatorProps) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 10, { duration: 1 });
  }, [target, map]);
  return null;
}

export function MapFitter({ bbox }: TMapFitterProps) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!bbox || fitted.current) return;
    map.fitBounds(
      [
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ],
      { padding: [24, 24] },
    );
    fitted.current = true;
  }, [bbox, map]);

  return null;
}
