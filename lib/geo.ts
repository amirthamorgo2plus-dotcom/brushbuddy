import { Painter } from "./types";

// Rough centre point for each city we support.
export const CITY_COORDS: Record<string, [number, number]> = {
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Hyderabad: [17.385, 78.4867],
  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
};

export const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

// Tiny stable hash so each painter sits at a steady spot near their city.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Where to place a painter on the map.
export function painterLatLng(p: Painter): [number, number] {
  if (typeof p.lat === "number" && typeof p.lng === "number") return [p.lat, p.lng];
  const base = CITY_COORDS[p.city] ?? INDIA_CENTER;
  const h = hash(p.id);
  const dLat = ((h % 1000) / 1000 - 0.5) * 0.06; // spread ~±3km
  const dLng = (((h >> 10) % 1000) / 1000 - 0.5) * 0.06;
  return [base[0] + dLat, base[1] + dLng];
}
