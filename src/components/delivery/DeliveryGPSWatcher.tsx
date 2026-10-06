'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Compass, Navigation, AlertTriangle, Play, Pause } from 'lucide-react';

interface DeliveryGPSWatcherProps {
  activeDeliveryId?: string;
  onLocationSent?: (coords: { lat: number; lng: number }) => void;
}

export default function DeliveryGPSWatcher({ activeDeliveryId, onLocationSent }: DeliveryGPSWatcherProps) {
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const demoIntervalRef = useRef<any>(null);

  // Send Location Update to authenticated API
  const sendLocation = async (latitude: number, longitude: number, heading = 0, speed = 0, accuracy = 10) => {
    try {
      const res = await fetch('/api/delivery/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          heading,
          speed,
          accuracy,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success && !data.throttled) {
        setLastCoords({ lat: latitude, lng: longitude });
        if (onLocationSent) onLocationSent({ lat: latitude, lng: longitude });
      }
    } catch (err) {
      console.error('Failed to post GPS update:', err);
    }
  };

  // Real Geolocation watchPosition Hook (Section 19)
  useEffect(() => {
    if (!activeDeliveryId || demoMode) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
      return;
    }

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsTracking(true);
      setGpsError(null);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading, speed, accuracy } = position.coords;
          sendLocation(latitude, longitude, heading || 0, speed || 0, accuracy || 10);
        },
        (err) => {
          console.warn('GPS Watch position error:', err.message);
          setGpsError('GPS permission denied or unavailable. Enable Demo Location Mode for testing.');
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 3000,
        }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [activeDeliveryId, demoMode]);

  // Dev Demo Location Simulation Mode (Section 50)
  useEffect(() => {
    if (!demoMode || !activeDeliveryId) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      return;
    }

    // Fictional trajectory from Connaught Place to Supplier & Customer
    let step = 0;
    const baseLat = 28.6139;
    const baseLng = 77.209;

    demoIntervalRef.current = setInterval(() => {
      step += 1;
      const lat = baseLat + step * 0.0005;
      const lng = baseLng + step * 0.0005;
      sendLocation(lat, lng, (step * 20) % 360, 5.5, 8);
    }, 4000);

    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [demoMode, activeDeliveryId]);

  if (!activeDeliveryId) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-xs text-white">Live GPS Location Watcher</span>
        </div>

        {/* Demo Mode Toggle */}
        <button
          onClick={() => setDemoMode((prev) => !prev)}
          className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition ${
            demoMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          {demoMode ? 'SIMULATED GPS DEMO' : 'Real Geolocation'}
        </button>
      </div>

      {lastCoords && (
        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-2">
          <Navigation className="w-3 h-3 text-emerald-400 animate-spin" />
          <span>Last Broadcast: {lastCoords.lat.toFixed(5)}, {lastCoords.lng.toFixed(5)}</span>
        </div>
      )}

      {gpsError && !demoMode && (
        <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/50 text-[10px] text-amber-300 font-bold flex items-center justify-between gap-2">
          <span>{gpsError}</span>
          <button
            onClick={() => setDemoMode(true)}
            className="px-2 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg shrink-0"
          >
            Enable Demo
          </button>
        </div>
      )}
    </div>
  );
}
