export type TLeafletMapProps = {
  lat: number;
  lng: number;
  label?: string;
  onMapClick: (lat: number, lng: number) => void;
};

export type TMapUpdaterProps = {
  lat: number;
  lng: number;
};
