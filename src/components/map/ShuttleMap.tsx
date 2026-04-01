import { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import type { RouteDoc, ShuttleDoc } from "../../types/models"
import { VIT_MAP_DEFAULTS } from "../../config/constants"
import { shuttleSeatLabel } from "../../lib/shuttleDisplay"
import { distanceKm, etaMinutes } from "../../lib/geo"
import RoadRoutePolylines from "./RoadRoutePolylines"
import { shuttleBusDivIcon } from "../../lib/shuttleMapIcon"

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function MapResizeHandler() {
  const map = useMap()
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 120)
    return () => window.clearTimeout(id)
  }, [map])
  return null
}

type Props = {
  shuttles: ShuttleDoc[]
  routes: RouteDoc[]
  userPosition: [number, number] | null
  selectedShuttleId: string | null
  onSelectShuttle: (id: string) => void
  onOpenShuttle?: (id: string) => void
}

export default function ShuttleMap({
  shuttles,
  routes,
  userPosition,
  selectedShuttleId,
  onSelectShuttle,
  onOpenShuttle,
}: Props) {
  return (
    <MapContainer
      center={[...VIT_MAP_DEFAULTS.center]}
      zoom={VIT_MAP_DEFAULTS.zoom}
      className="h-full min-h-[280px] w-full z-0"
      scrollWheelZoom
    >
      <MapResizeHandler />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RoadRoutePolylines routes={routes} />

      {userPosition && (
        <CircleMarker
          center={userPosition}
          radius={8}
          pathOptions={{
            color: "#0f766e",
            fillColor: "#14b8a6",
            fillOpacity: 0.35,
            weight: 2,
          }}
        >
          <Popup>You (approx.)</Popup>
        </CircleMarker>
      )}

      {shuttles.map((s) => {
        const lat = s.current_location?.lat
        const lng = s.current_location?.lng
        if (typeof lat !== "number" || typeof lng !== "number") return null
        const selected = selectedShuttleId === s._id
        const sid = s._id.slice(-6).toUpperCase()
        const seatWord = shuttleSeatLabel(s)
        const isFull = seatWord === "Full"
        let etaLine = ""
        if (userPosition) {
          const d = distanceKm(userPosition[0], userPosition[1], lat, lng)
          etaLine = `~${etaMinutes(d)} min from you · ${d.toFixed(2)} km`
        }
        return (
          <Marker
            key={s._id}
            position={[lat, lng]}
            icon={shuttleBusDivIcon({ selected, full: isFull })}
            eventHandlers={{
              click: () => {
                onOpenShuttle?.(s._id)
                onSelectShuttle(s._id)
              },
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-slate-900">
                  {s.shuttle_number}
                </p>
                <p className="text-xs text-slate-500 font-mono">ID …{sid}</p>
                <p className="text-sm text-slate-600">
                  {s.route_id?.route_name ?? "Route"}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Seats: <strong>{seatWord}</strong> · {s.status}
                </p>
                {etaLine && (
                  <p
                    className={`text-xs mt-1 ${
                      isFull ? "text-red-800" : "text-teal-800"
                    }`}
                  >
                    {etaLine}
                  </p>
                )}
                <Link
                  to={`/shuttle/${s._id}`}
                  className={`mt-2 inline-block text-sm font-medium underline ${
                    isFull ? "text-red-700" : "text-teal-700"
                  }`}
                >
                  Route &amp; book →
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
