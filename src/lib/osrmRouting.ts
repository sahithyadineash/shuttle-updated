import { getRoutingApiBase } from "../config/env"

type OsrmGeoJsonResponse = {
  code?: string
  routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>
}

/**
 * Fetches a single driving line through waypoints (ordered stops) via OSRM (proxied).
 * Coordinates: [lat, lng]. Returns [lat, lng][] for Leaflet.
 */
export async function fetchOsrmRouteLatLng(
  waypointsLatLng: [number, number][]
): Promise<[number, number][]> {
  if (waypointsLatLng.length < 2) return []
  const coordStr = waypointsLatLng.map(([lat, lng]) => `${lng},${lat}`).join(";")
  const qs = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
  })
  const path = `/route/v1/driving/${coordStr}?${qs.toString()}`
  const res = await fetch(`${getRoutingApiBase()}${path}`)
  const data = (await res.json()) as OsrmGeoJsonResponse
  const coords = data.routes?.[0]?.geometry?.coordinates
  if (!res.ok || data.code !== "Ok" || !coords?.length) {
    throw new Error(data.code || "No route")
  }
  return coords.map(([lng, lat]) => [lat, lng] as [number, number])
}
