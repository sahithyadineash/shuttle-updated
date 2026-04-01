/**
 * VIT Vellore campus — map center and canonical stops (matches seed script).
 */
export const VIT_STOPS = [
  { name: "SJT (Silver Jubilee Tower)", lat: 12.969856, lng: 79.158529, order: 1 },
  { name: "Technology Tower (TT)", lat: 12.970873, lng: 79.159744, order: 2 },
  { name: "PRP (Pearl Research Park)", lat: 12.97021, lng: 79.15921, order: 3 },
  { name: "Mahatma Gandhi Block (MGB)", lat: 12.9712, lng: 79.1588, order: 4 },
  { name: "GDN (G.D. Naidu Block)", lat: 12.97245, lng: 79.1602, order: 5 },
  {
    name: "Main Library (Periyar Library)",
    lat: 12.97295,
    lng: 79.1596,
    order: 6,
  },
  { name: "Main Gate (VIT Entrance)", lat: 12.969106, lng: 79.1559, order: 7 },
  { name: "TT Food Court Area", lat: 12.97065, lng: 79.15995, order: 8 },
  {
    name: "Ladies Hostel H Block",
    lat: 12.97185,
    lng: 79.1622,
    order: 9,
  },
] as const

const avg = (arr: number[]) =>
  arr.reduce((a, b) => a + b, 0) / arr.length

export const VIT_CAMPUS_CENTER: [number, number] = [
  avg([...VIT_STOPS.map((s) => s.lat)]),
  avg([...VIT_STOPS.map((s) => s.lng)]),
]

export const VIT_MAP_DEFAULTS = {
  center: VIT_CAMPUS_CENTER,
  zoom: 16,
} as const

export const VIT_CAMPUS_CORNERS = {
  sw: [12.966, 79.153] as [number, number],
  ne: [12.976, 79.164] as [number, number],
}

/** Map payment destination label → lat/lng for driver traffic circles. */
export function coordsForDestination(name: string | undefined): [number, number] | null {
  if (!name) return null
  const exact = VIT_STOPS.find((s) => s.name === name)
  if (exact) return [exact.lat, exact.lng]
  const lower = name.toLowerCase()
  const rough = VIT_STOPS.find(
    (s) =>
      lower.includes(s.name.toLowerCase().slice(0, 12)) ||
      s.name.toLowerCase().includes(lower.slice(0, 14))
  )
  return rough ? [rough.lat, rough.lng] : null
}
