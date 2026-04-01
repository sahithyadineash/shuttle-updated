export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Rough ETA for short campus hops (km/h). */
export function etaMinutes(distanceKm: number, speedKmh = 22): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0
  return Math.max(1, Math.round((distanceKm / speedKmh) * 60))
}
