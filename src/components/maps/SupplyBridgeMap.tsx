'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { isMapboxConfigured, MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER } from '@/lib/mapbox';
import { Navigation, Store, MapPin, Compass, ShieldCheck, Star } from 'lucide-react';

export interface SupplierMarkerData {
  id: string;
  businessName: string;
  rating: number;
  deliveryTime?: number;
  latitude: number;
  longitude: number;
  address?: string;
  isAvailable?: boolean;
}

interface SupplyBridgeMapProps {
  suppliers?: SupplierMarkerData[];
  onSelectSupplier?: (supplierId: string) => void;
  className?: string;
  height?: string;
}

export default function SupplyBridgeMap({
  suppliers = [],
  onSelectSupplier,
  className = '',
  height = '400px',
}: SupplyBridgeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const supplierMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mapboxReady, setMapboxReady] = useState(false);

  // Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!isMapboxConfigured()) {
      setMapboxReady(false);
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center: DEFAULT_CENTER,
      zoom: 13,
      pitch: 35,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
    mapRef.current = map;

    map.on('load', () => {
      setMapboxReady(true);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Request Customer Geolocation
  const requestLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(coords);
          setHasPermission(true);

          if (mapRef.current) {
            mapRef.current.flyTo({ center: coords, zoom: 14 });

            if (!userMarkerRef.current) {
              const el = document.createElement('div');
              el.className = 'w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg pulse-glow flex items-center justify-center text-slate-950 text-[10px] font-black';
              el.innerText = 'YOU';

              userMarkerRef.current = new mapboxgl.Marker({ element: el })
                .setLngLat(coords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<div class="p-2 text-xs font-bold text-slate-900">Your Current Location</div>'))
                .addTo(mapRef.current);
            } else {
              userMarkerRef.current.setLngLat(coords);
            }
          }
        },
        (err) => {
          console.warn('Geolocation permission denied/error:', err.message);
          setHasPermission(false);
        }
      );
    }
  };

  useEffect(() => {
    requestLocation();
  }, [mapboxReady]);

  // Render Supplier Markers
  useEffect(() => {
    if (!mapRef.current || !mapboxReady) return;

    // Clear previous markers
    supplierMarkersRef.current.forEach((m) => m.remove());
    supplierMarkersRef.current = [];

    suppliers.forEach((s) => {
      if (!s.latitude || !s.longitude) return;

      const el = document.createElement('div');
      el.className = 'cursor-pointer group flex flex-col items-center';
      el.innerHTML = `
        <div class="px-2 py-1 bg-slate-900 border border-emerald-500/50 rounded-xl text-[10px] font-black text-emerald-400 shadow-xl flex items-center gap-1 backdrop-blur-md group-hover:scale-110 transition-transform">
          <span>🏪 ${s.businessName}</span>
          <span class="text-amber-400">★ ${s.rating.toFixed(1)}</span>
        </div>
        <div class="w-3 h-3 bg-emerald-500 rotate-45 -mt-1 shadow-md"></div>
      `;

      el.addEventListener('click', () => {
        if (onSelectSupplier) onSelectSupplier(s.id);
      });

      const popupHtml = `
        <div class="p-2 space-y-1 text-slate-900 font-sans">
          <div class="font-bold text-xs flex items-center gap-1">
            <span>${s.businessName}</span>
            <span class="text-emerald-600 font-bold">(${s.rating}★)</span>
          </div>
          <div class="text-[11px] text-slate-600">${s.address || 'Verified Local Supplier'}</div>
          ${s.deliveryTime ? `<div class="text-[10px] font-bold text-emerald-600">⚡ ~${s.deliveryTime} mins delivery</div>` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([s.longitude, s.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml))
        .addTo(mapRef.current!);

      supplierMarkersRef.current.push(marker);
    });
  }, [suppliers, mapboxReady, onSelectSupplier]);

  return (
    <div className={`relative rounded-3xl overflow-hidden glass-panel border border-slate-800 ${className}`}>
      {/* Mapbox Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-slate-950" />

      {/* Fallback Display if Mapbox Access Token is missing */}
      {!isMapboxConfigured() && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg">
            <Compass className="w-7 h-7 animate-pulse" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-extrabold text-sm text-white">Mapbox Live Marketplace View</h3>
            <p className="text-xs text-slate-400">
              Interactive satellite & street view of nearby verified suppliers. Configure <code className="text-emerald-400 font-mono text-[11px]">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in <code className="text-emerald-400 font-mono text-[11px]">.env</code> for full Mapbox GL JS graphics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {suppliers.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSupplier && onSelectSupplier(s.id)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer hover:border-emerald-500 transition"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>{s.businessName}</span>
                <span className="text-amber-400">({s.rating}★)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-white shadow-xl pointer-events-none">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span>SupplyBridge Live Map</span>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
          {suppliers.length} Stores Nearby
        </span>
      </div>

      {/* Recenter Location Button */}
      {isMapboxConfigured() && (
        <button
          onClick={requestLocation}
          className="absolute top-3 right-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-emerald-400 transition shadow-xl"
          title="Recenter on my location"
        >
          <Navigation className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
