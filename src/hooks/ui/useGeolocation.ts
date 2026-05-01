import { WikidataService } from "@/api/services/wikidataService";
import type { TWikidataCity } from "@/types";
import { useState } from "react";

type TGeolocationError = "denied" | "unavailable" | null;

type TUseGeolocationReturn = {
  locate: (onSuccess: (city: TWikidataCity) => void) => void;
  isLocating: boolean;
  locationError: TGeolocationError;
  clearLocationError: () => void;
};

export function useGeolocation(): TUseGeolocationReturn {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<TGeolocationError>(null);

  function locate(onSuccess: (city: TWikidataCity) => void) {
    if (!navigator.geolocation) {
      setLocationError("unavailable");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const { latitude, longitude } = position.coords;
            const city = await WikidataService.findNearestCityByCoordinates(latitude, longitude);
            if (city) {
              onSuccess(city);
            } else {
              setLocationError("unavailable");
            }
          } catch {
            setLocationError("unavailable");
          } finally {
            setIsLocating(false);
          }
        })();
      },
      (err) => {
        setIsLocating(false);
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setLocationError("denied");
        } else {
          setLocationError("unavailable");
        }
      },
    );
  }

  function clearLocationError() {
    setLocationError(null);
  }

  return { locate, isLocating, locationError, clearLocationError };
}
