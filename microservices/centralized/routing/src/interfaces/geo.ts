import axios from "axios";

const cache = new Map<string, [number, number]>();

export async function geocodeAddress(address: string): Promise<[number, number]> {
  if (cache.has(address)) {
    return cache.get(address)!;
  }

  const url = "https://nominatim.openstreetmap.org/search";
  const res = await axios.get<any>(url, {
    params: { q: address, format: "json", limit: 1 },
    headers: { "User-Agent": "warehouse-distance-service" },
  });

  if (!res.data || res.data.length === 0) {
    throw new Error(`Impossibile geocodificare l'indirizzo: ${address}`);
  }

  const coords: [number, number] = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
  cache.set(address, coords); // cache in memoria
  console.log(`Geocoded ${address} to ${coords[0]}, ${coords[1]}`);
  return coords;
}

export function haversine([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
