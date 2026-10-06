export const MAPBOX_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export const DEFAULT_CENTER: [number, number] = [77.5946, 12.9716]; // Bengaluru [lng, lat]

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11';

/**
 * Check if a valid Mapbox token is present.
 */
export function isMapboxConfigured(): boolean {
  return (
    typeof MAPBOX_ACCESS_TOKEN === 'string' &&
    MAPBOX_ACCESS_TOKEN.length > 10 &&
    MAPBOX_ACCESS_TOKEN.startsWith('pk.')
  );
}

/**
 * Fetch polyline route coordinates between origin and destination using Mapbox Directions API.
 */
export async function getMapboxRoute(
  origin: [number, number], // [lng, lat]
  destination: [number, number] // [lng, lat]
): Promise<[number, number][]> {
  if (!isMapboxConfigured()) {
    // Return straight interpolation points if token is missing
    return [
      origin,
      [
        origin[0] + (destination[0] - origin[0]) * 0.5,
        origin[1] + (destination[1] - origin[1]) * 0.5,
      ],
      destination,
    ];
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes && data.routes[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates as [number, number][];
    }
  } catch (err) {
    console.error('Failed to fetch Mapbox route:', err);
  }

  return [origin, destination];
}
