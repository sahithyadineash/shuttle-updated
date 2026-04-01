import { useEffect, useMemo, useState } from "react"
import { Polyline } from "react-leaflet"
import type { RouteDoc } from "../../types/models"
import { fetchOsrmRouteLatLng } from "../../lib/osrmRouting"

const DEFAULT_COLORS = [
  "#0d9488",
  "#2563eb",
  "#7c3aed",
  "#c026d3",
  "#ea580c",
]

type Props = {
  routes: RouteDoc[]
  colors?: string[]
  opacity?: number
  weight?: number
}

function routesFingerprint(routes: RouteDoc[]): string {
  return routes
    .map((r) => {
      const s = [...r.stops].sort((a, b) => a.order - b.order)
      return `${r._id}:${s.map((x) => `${x.lat},${x.lng}`).join(";")}`
    })
    .join("|")
}

export default function RoadRoutePolylines({
  routes,
  colors = DEFAULT_COLORS,
  opacity = 0.55,
  weight = 4,
}: Props) {
  const [linesById, setLinesById] = useState<
    Record<string, [number, number][]>
  >({})
  const key = useMemo(() => routesFingerprint(routes), [routes])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const next: Record<string, [number, number][]> = {}
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i]
        const sorted = [...route.stops].sort((a, b) => a.order - b.order)
        if (sorted.length < 2) continue
        const pts = sorted.map((s) => [s.lat, s.lng] as [number, number])
        try {
          const line = await fetchOsrmRouteLatLng(pts)
          if (!cancelled) next[route._id] = line
        } catch {
          if (!cancelled) next[route._id] = pts
        }
      }
      if (!cancelled) setLinesById(next)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [key])

  return (
    <>
      {routes.map((route, idx) => {
        const positions = linesById[route._id]
        if (!positions?.length) return null
        const color = colors[idx % colors.length]
        return (
          <Polyline
            key={route._id}
            positions={positions}
            pathOptions={{ color, weight, opacity }}
          />
        )
      })}
    </>
  )
}
