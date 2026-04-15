export type TLeafletMapProps = {
  lat: number;
  lng: number;
  label?: string;
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
};

export type TMapUpdaterProps = {
  lat: number;
  lng: number;
};
