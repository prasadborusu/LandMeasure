import { useState, useCallback, useEffect, useRef } from 'react';
import type { LocationState } from '../types/measurement';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>({
    lat: 17.385044, // Default fallback center (Hyderabad)
    lng: 78.486671,
    accuracy: 0,
    altitude: null,
    heading: null,
    speed: null,
    active: false,
    isLiveTracking: false,
    lastUpdated: undefined,
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [followUser, setFollowUser] = useState<boolean>(true);

  const watchIdRef = useRef<number | null>(null);

  const formatError = (err: GeolocationPositionError): string => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Location permission denied. Please allow location access in your browser settings.';
      case err.POSITION_UNAVAILABLE:
        return 'GPS signal unavailable. Please ensure your device location is enabled.';
      case err.TIMEOUT:
        return 'Location acquisition timed out. Retrying GPS lock...';
      default:
        return 'Unable to access your location. Please move the map manually.';
    }
  };

  // Helper to update location state from GeolocationPosition
  const updatePosition = useCallback((pos: GeolocationPosition, isTracking: boolean) => {
    setLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      active: true,
      isLiveTracking: isTracking,
      lastUpdated: pos.timestamp,
    });
  }, []);

  // Single-shot location request
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        updatePosition(pos, false);
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage(formatError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );
  }, [updatePosition]);

  // Start continuous live tracking
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsLocating(true);
    setErrorMessage(null);
    setFollowUser(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setIsLocating(false);
        updatePosition(pos, true);
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage(formatError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = id;
    setLocation((prev) => ({ ...prev, isLiveTracking: true }));
  }, [updatePosition]);

  // Stop continuous live tracking
  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocation((prev) => ({ ...prev, isLiveTracking: false }));
  }, []);

  // Toggle live tracking
  const toggleLiveTracking = useCallback(() => {
    if (location.isLiveTracking) {
      stopLiveTracking();
    } else {
      startLiveTracking();
    }
  }, [location.isLiveTracking, startLiveTracking, stopLiveTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    location,
    isLocating,
    errorMessage,
    followUser,
    setFollowUser,
    requestLocation,
    startLiveTracking,
    stopLiveTracking,
    toggleLiveTracking,
    clearError,
  };
}
