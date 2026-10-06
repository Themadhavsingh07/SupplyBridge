import { useState, useEffect, useRef, useCallback } from 'react';

interface TrackerOptions {
  orderId: string;
  enabled?: boolean;
  minDistanceMeters?: number;
  intervalMs?: number;
}

export function useDeliveryTracker({
  orderId,
  enabled = true,
  minDistanceMeters = 10,
  intervalMs = 4000,
}: TrackerOptions) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastSentLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Calculate distance between two lat/lng pairs in meters using Haversine formula
  const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const sendLocationToServer = useCallback(
    async (lat: number, lng: number, speed?: number, heading?: number) => {
      const now = Date.now();
      const last = lastSentLocationRef.current;

      if (last) {
        const dist = getDistanceMeters(last.lat, last.lng, lat, lng);
        const timePassed = now - last.time;

        // Intelligent Throttling: Update server only if moved > minDistanceMeters OR > intervalMs elapsed
        if (dist < minDistanceMeters && timePassed < intervalMs) {
          return;
        }
      }

      try {
        const res = await fetch('/api/delivery/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            latitude: lat,
            longitude: lng,
            speed: speed || 0,
            heading: heading || 0,
          }),
        });

        if (res.ok) {
          lastSentLocationRef.current = { lat, lng, time: now };
          setError(null);
        }
      } catch (err) {
        console.error('Failed to send delivery location:', err);
      }
    },
    [orderId, minDistanceMeters, intervalMs]
  );

  useEffect(() => {
    if (!enabled || !orderId || typeof window === 'undefined' || !('geolocation' in navigator)) {
      setIsTracking(false);
      return;
    }

    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        sendLocationToServer(latitude, longitude, speed || undefined, heading || undefined);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setIsTracking(false);
    };
  }, [enabled, orderId, sendLocationToServer]);

  return { isTracking, currentLocation, error };
}
