import { Painter } from "./types";

// Centre point for each city we support (launch region: Tamil Nadu).
export const CITY_COORDS: Record<string, [number, number]> = {
  Coimbatore: [11.0168, 76.9558],
  Tiruppur: [11.1085, 77.3411],
  Erode: [11.341, 77.7172],
  Salem: [11.6643, 78.146],
};

// Neighbourhood centres in Coimbatore (our launch city) for accurate pins.
export const AREA_COORDS: Record<string, [number, number]> = {
  "RS Puram": [11.0064, 76.9558],
  Gandhipuram: [11.0177, 76.9659],
  Peelamedu: [11.0258, 77.0044],
  Saravanampatti: [11.079, 77.001],
  Singanallur: [11.006, 77.0289],
  Ramanathapuram: [10.996, 76.98],
  Vadavalli: [11.029, 76.907],
  Ganapathy: [11.041, 76.974],
  "Race Course": [11.001, 76.972],
  "Saibaba Colony": [11.025, 76.945],
  Ukkadam: [10.989, 76.956],
  Thudiyalur: [11.079, 76.941],
  Kuniyamuthur: [10.966, 76.961],
  Sulur: [11.024, 77.127],
};

export const COIMBATORE_CENTER: [number, number] = [11.0168, 76.9558];
export const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

// Tiny stable hash so each painter sits at a steady spot near their area/city.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Where to place a painter on the map.
export function painterLatLng(p: Painter): [number, number] {
  if (typeof p.lat === "number" && typeof p.lng === "number") return [p.lat, p.lng];

  let base: [number, number];
  let spread: number;
  if (p.area && AREA_COORDS[p.area]) {
    base = AREA_COORDS[p.area];
    spread = 0.012; // ~±0.6km inside a neighbourhood
  } else {
    base = CITY_COORDS[p.city] ?? COIMBATORE_CENTER;
    spread = 0.06; // ~±3km across a city
  }

  const h = hash(p.id);
  const dLat = ((h % 1000) / 1000 - 0.5) * spread;
  const dLng = (((h >> 10) % 1000) / 1000 - 0.5) * spread;
  return [base[0] + dLat, base[1] + dLng];
}
