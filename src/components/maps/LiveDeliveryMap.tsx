'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { isMapboxConfigured, MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE, getMapboxRoute } from '@/lib/mapbox';
import { subscribeToOrderLocation, DeliveryLocationPayload } from '@/lib/supabase';
import { Bike, Store, MapPin, ShieldCheck, Compass } from 'lucide-react';

interface LiveDeliveryMapProps {
  orderId: string;
  supplierName: string;
  supplierLocation: [number, number]; // [lng, lat]
  customerLocation: [number, number]; // [lng, lat]
  initialDriverLocation?: [number, number]; // [lng, lat]
  orderStatus: string;
  height?: string;
  className?: string;
}

export default function LiveDeliveryMap({
  orderId,
  supplierName,
  supplierLocation,
  customerLocation,
  initialDriverLocation,
  orderStatus,
  height = '420px',
  className = '',
}: LiveDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverElementRef = useRef<HTMLDivElement | null>(null);

  const [currentDriverCoords, setCurrentDriverCoords] = useState<[number, number]>(
    initialDriverLocation || [
      (supplierLocation[0] + customerLocation[0]) / 2,
      (supplierLocation[1] + customerLocation[1]) / 2,
    ]
  );

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
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
      center: currentDriverCoords,
      zoom: 14,
      pitch: 30,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
    mapRef.current = map;

    map.on('load', async () => {
      setMapboxReady(true);

      // Add Supplier Marker
      const supplierEl = document.createElement('div');
      supplierEl.className = 'w-9 h-9 rounded-xl bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg font-bold text-xs';
      supplierEl.innerHTML = '🏪';
      new mapboxgl.Marker({ element: supplierEl })
        .setLngLat(supplierLocation)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div class="p-1 font-bold text-xs text-slate-900">Supplier: ${supplierName}</div>`))
        .addTo(map);

      // Add Customer Destination Marker
      const customerEl = document.createElement('div');
      customerEl.className = 'w-9 h-9 rounded-xl bg-indigo-950 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center shadow-lg font-bold text-xs';
      customerEl.innerHTML = '📍';
      new mapboxgl.Marker({ element: customerEl })
        .setLngLat(customerLocation)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<div class="p-1 font-bold text-xs text-slate-900">Delivery Destination</div>'))
        .addTo(map);

      // Add Delivery Partner Live Marker
      const driverEl = document.createElement('div');
      driverEl.className = 'w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white pulse-glow transition-all duration-700 ease-out';
      driverEl.innerHTML = '🛵';
      driverElementRef.current = driverEl;

      driverMarkerRef.current = new mapboxgl.Marker({ element: driverEl })
        .setLngLat(currentDriverCoords)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<div class="p-1 font-bold text-xs text-slate-900">Live Delivery Partner</div>'))
        .addTo(map);

      // Fetch & Draw Route Polyline
      const routeCoords = await getMapboxRoute(supplierLocation, customerLocation);

      if (map.getSource('route')) return;

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoords,
          },
        },
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 5,
          'line-opacity': 0.85,
        },
      });

      // Fit map bounds to encompass supplier, customer, and driver
      const bounds = new mapboxgl.LngLatBounds()
        .extend(supplierLocation)
        .extend(customerLocation)
        .extend(currentDriverCoords);

      map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
    });

    return () => {
      map.remove();
    };
  }, []);

  // Supabase Realtime Subscription to Order Location Channel
  useEffect(() => {
    const unsubscribe = subscribeToOrderLocation(
      orderId,
      (locationUpdate: DeliveryLocationPayload) => {
        const newCoords: [number, number] = [
          locationUpdate.longitude,
          locationUpdate.latitude,
        ];
        setCurrentDriverCoords(newCoords);
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        // Update Mapbox Marker dynamically WITHOUT reloading page or re-creating map
        if (driverMarkerRef.current && mapRef.current) {
          driverMarkerRef.current.setLngLat(newCoords);

          // Apply heading rotation if provided
          if (locationUpdate.heading !== undefined && driverElementRef.current) {
            driverElementRef.current.style.transform = `rotate(${locationUpdate.heading}deg)`;
          }

          mapRef.current.easeTo({
            center: newCoords,
            duration: 1000,
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  return (
    <div className={`relative rounded-3xl overflow-hidden glass-panel border border-slate-800 ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-slate-950" />

      {/* Fallback View when Mapbox Token is not present */}
      {!isMapboxConfigured() && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-sm text-white">Live Realtime Delivery Tracking</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                {orderStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="relative pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2">
                <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-emerald-400" /> {supplierName}</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">🛵 Driver Live ({currentDriverCoords[1].toFixed(4)}, {currentDriverCoords[0].toFixed(4)})</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> Customer</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 w-3/4 pulse-glow" />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Add <code className="text-emerald-400 font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in <code className="text-emerald-400 font-mono">.env</code> to enable live Mapbox GL JS 3D vector map routing.
            </p>
          </div>
        </div>
      )}

      {/* Realtime Live Overlay Indicator */}
      <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-white shadow-xl pointer-events-none">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span>Supabase Realtime GPS</span>
        {lastUpdatedTime && (
          <span className="text-[10px] text-slate-400 font-mono border-l border-slate-800 pl-2">
            Updated {lastUpdatedTime}
          </span>
        )}
      </div>
    </div>
  );
}
