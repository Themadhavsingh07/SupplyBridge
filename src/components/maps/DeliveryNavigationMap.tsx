'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { isMapboxConfigured, MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE } from '@/lib/mapbox';
import { Navigation, MapPin, Store, Compass } from 'lucide-react';

interface DeliveryNavigationMapProps {
  pickupLocation: [number, number]; // [lng, lat]
  dropoffLocation: [number, number]; // [lng, lat]
  currentLocation?: [number, number]; // [lng, lat]
  stage?: 'pickup' | 'dropoff';
  height?: string;
  className?: string;
}

export default function DeliveryNavigationMap({
  pickupLocation,
  dropoffLocation,
  currentLocation,
  stage = 'pickup',
  height = '360px',
  className = '',
}: DeliveryNavigationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!isMapboxConfigured()) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const center = currentLocation || (stage === 'pickup' ? pickupLocation : dropoffLocation);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center,
      zoom: 14,
      pitch: 45,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    mapRef.current = map;

    map.on('load', () => {
      // Pickup Marker
      const pEl = document.createElement('div');
      pEl.className = 'w-8 h-8 rounded-xl bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-lg';
      pEl.innerText = '🏪';
      new mapboxgl.Marker({ element: pEl }).setLngLat(pickupLocation).addTo(map);

      // Dropoff Marker
      const dEl = document.createElement('div');
      dEl.className = 'w-8 h-8 rounded-xl bg-indigo-950 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center font-bold text-xs shadow-lg';
      dEl.innerText = '📍';
      new mapboxgl.Marker({ element: dEl }).setLngLat(dropoffLocation).addTo(map);

      // Rider Marker if available
      if (currentLocation) {
        const rEl = document.createElement('div');
        rEl.className = 'w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs border-2 border-white shadow-xl pulse-glow';
        rEl.innerText = '🛵';
        new mapboxgl.Marker({ element: rEl }).setLngLat(currentLocation).addTo(map);
      }
    });

    return () => {
      map.remove();
    };
  }, [pickupLocation, dropoffLocation, currentLocation, stage]);

  return (
    <div className={`relative rounded-3xl overflow-hidden glass-panel border border-slate-800 ${className}`}>
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-slate-950" />

      {!isMapboxConfigured() && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-2">
          <Compass className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
          <h3 className="font-bold text-xs text-white">Delivery Partner Navigation Map</h3>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Turn-by-turn Mapbox navigation mode between store pickup and customer address.
          </p>
        </div>
      )}
    </div>
  );
}
