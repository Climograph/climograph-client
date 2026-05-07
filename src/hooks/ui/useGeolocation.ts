import { WikidataService } from "@/api/services/wikidataService";
import type { TWikidataCity } from "@/types";
import { useState } from "react";

const GEOLOCATION_ERRORS = {
  NOT_SUPPORTED: "geolocation.notSupported",
  HTTPS_REQUIRED: "geolocation.httpsRequired",
  PERMISSION_DENIED: "geolocation.permissionDenied",
  UNAVAILABLE: "geolocation.unavailable",
  TIMEOUT: "geolocation.timeout",
  UNKNOWN: "geolocation.unknown",
} as const;

type TGeolocationError = (typeof GEOLOCATION_ERRORS)[keyof typeof GEOLOCATION_ERRORS] | null;

type TUseGeolocationReturn = {
  locate: (onSuccess: (city: TWikidataCity) => void) => void;
  isLocating: boolean;
  locationError: TGeolocationError;
  clearLocationError: () => void;
};

function getGeolocationErrorMessage(code: GeolocationPositionError["code"]): TGeolocationError {
  const errorMap: Record<GeolocationPositionError["code"], TGeolocationError> = {
    [GeolocationPositionError.PERMISSION_DENIED]: GEOLOCATION_ERRORS.PERMISSION_DENIED,
    [GeolocationPositionError.POSITION_UNAVAILABLE]: GEOLOCATION_ERRORS.UNAVAILABLE,
    [GeolocationPositionError.TIMEOUT]: GEOLOCATION_ERRORS.TIMEOUT,
  };

  return errorMap[code] ?? GEOLOCATION_ERRORS.UNKNOWN;
}

export function useGeolocation(): TUseGeolocationReturn {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<TGeolocationError>(null);

  function locate(onSuccess: (city: TWikidataCity) => void) {
    if (!navigator.geolocation) {
      setLocationError(GEOLOCATION_ERRORS.NOT_SUPPORTED);
      return;
    }

    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      setLocationError(GEOLOCATION_ERRORS.HTTPS_REQUIRED);
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
              setLocationError(GEOLOCATION_ERRORS.UNAVAILABLE);
            }
          } catch {
            setLocationError(GEOLOCATION_ERRORS.UNAVAILABLE);
          } finally {
            setIsLocating(false);
          }
        })();
      },
      (err) => {
        setIsLocating(false);
        setLocationError(getGeolocationErrorMessage(err.code));
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  function clearLocationError() {
    setLocationError(null);
  }

  return { locate, isLocating, locationError, clearLocationError };
}
