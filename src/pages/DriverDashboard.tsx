import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import { api } from "../lib/api"
import { useSocket } from "../hooks/useSocket"
import type { LocationUpdatedPayload, PaymentDoc, RouteDoc, ShuttleDoc } from "../types/models"
import {
  VIT_MAP_DEFAULTS,
  coordsForDestination,
} from "../config/constants"
import { shuttleSeatLabel } from "../lib/shuttleDisplay"
import { shuttleBusDivIcon } from "../lib/shuttleMapIcon"
import RoadRoutePolylines from "../components/map/RoadRoutePolylines"
import { isAxiosError } from "axios"

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

type DestinationStat = { destination: string; count: number }

function isRoute(r: ShuttleDoc["route_id"]): r is RouteDoc {
  return r !== null && typeof r === "object" && "stops" in r
}

export default function DriverDashboard() {
  const { socket } = useSocket()
  const [shuttles, setShuttles] = useState<ShuttleDoc[]>([])
  const [payments, setPayments] = useState<PaymentDoc[]>([])
  const [stats, setStats] = useState<DestinationStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setError(null)
    try {
      const [shRes, payRes, stRes] = await Promise.all([
        api.get<ShuttleDoc[]>("/shuttles/mine"),
        api.get<PaymentDoc[]>("/payments/driver/shuttle-feed"),
        api.get<{ stats: DestinationStat[] }>("/payments/destination-stats"),
      ])
      setShuttles(shRes.data)
      setPayments(payRes.data)
      setStats(stRes.data.stats ?? [])
    } catch (e) {
      const msg = isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Failed to load driver data"
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    const onLoc = (data: LocationUpdatedPayload) => {
      setShuttles((prev) =>
        prev.map((s) =>
          String(s._id) === String(data.shuttle_id)
            ? {
                ...s,
                current_location: { lat: data.lat, lng: data.lng },
              }
            : s
        )
      )
    }
    socket.on("location-updated", onLoc)
    return () => {
      socket.off("location-updated", onLoc)
    }
  }, [socket])

  const routePolylines = useMemo(() => {
    const seen = new Map<string, RouteDoc>()
    for (const s of shuttles) {
      if (isRoute(s.route_id) && !seen.has(s.route_id._id)) {
        seen.set(s.route_id._id, s.route_id)
      }
    }
    return [...seen.values()]
  }, [shuttles])

  const setAvailability = async (shuttle: ShuttleDoc, seat_status: "available" | "full") => {
    setBusyId(shuttle._id)
    setError(null)
    try {
      const { data } = await api.patch<ShuttleDoc>(
        `/shuttles/${shuttle._id}/availability`,
        { seat_status }
      )
      setShuttles((prev) => prev.map((s) => (s._id === data._id ? data : s)))
    } catch (e) {
      const msg = isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Update failed"
      setError(String(msg))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Driver console</h1>
        <p className="text-sm text-slate-500">
          Mark your shuttle Available or Full. Recent student payments and busy
          stops (7 days) are below.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-700">{error}</p>
        )}
        <button
          type="button"
          onClick={() => loadAll()}
          className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
        <section className="relative min-h-[300px] flex-[2] overflow-hidden rounded-xl border border-slate-200 bg-white lg:min-h-[480px]">
          <MapContainer
            center={[...VIT_MAP_DEFAULTS.center]}
            zoom={VIT_MAP_DEFAULTS.zoom}
            className="h-[320px] w-full lg:h-full lg:min-h-[480px]"
            scrollWheelZoom
          >
            <MapResizeHandler />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RoadRoutePolylines
              routes={routePolylines}
              opacity={0.45}
              weight={4}
            />
            {stats.map((s) => {
              const c = coordsForDestination(s.destination)
              if (!c) return null
              const r = 8 + Math.min(s.count * 4, 40)
              return (
                <CircleMarker
                  key={s.destination}
                  center={c}
                  radius={r}
                  pathOptions={{
                    color: "#b45309",
                    fillColor: "#fbbf24",
                    fillOpacity: 0.35,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong>{s.destination}</strong>
                    <br />
                    Paid rides (7d): {s.count}
                  </Popup>
                </CircleMarker>
              )
            })}
            {shuttles.map((s) => {
              const lat = s.current_location?.lat
              const lng = s.current_location?.lng
              if (typeof lat !== "number" || typeof lng !== "number") return null
              const sid = s._id.slice(-6).toUpperCase()
              return (
                <Marker
                  key={s._id}
                  position={[lat, lng]}
                  icon={shuttleBusDivIcon({
                    full: shuttleSeatLabel(s) === "Full",
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{s.shuttle_number}</strong> · …{sid}
                      <br />
                      Seats: {shuttleSeatLabel(s)}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </section>

        <aside className="flex w-full flex-col gap-4 lg:w-[400px] lg:flex-shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">Your shuttles</h2>
            {shuttles.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                No shuttle assigned. Ask admin to set{" "}
                <code className="rounded bg-slate-100 px-1">driver_id</code> on
                your shuttle document in MongoDB.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {shuttles.map((s) => {
                  const label = shuttleSeatLabel(s)
                  const sid = s._id.slice(-6).toUpperCase()
                  return (
                    <li
                      key={s._id}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <p className="font-medium text-slate-900">
                        {s.shuttle_number}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          …{sid}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Now:{" "}
                        <strong
                          className={
                            label === "Full" ? "text-red-700" : "text-slate-900"
                          }
                        >
                          {label}
                        </strong>
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === s._id || label === "Available"}
                          onClick={() => setAvailability(s, "available")}
                          className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white disabled:opacity-40"
                        >
                          Mark available
                        </button>
                        <button
                          type="button"
                          disabled={busyId === s._id || label === "Full"}
                          onClick={() => setAvailability(s, "full")}
                          className="flex-1 rounded-lg bg-slate-700 py-2 text-xs font-medium text-white disabled:opacity-40"
                        >
                          Mark full
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">Recent payments</h2>
            {payments.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No paid rides yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {payments.map((p) => {
                  const u = p.user_id
                  const name =
                    u && typeof u === "object" && "name" in u
                      ? u.name
                      : "Student"
                  return (
                    <li
                      key={p._id}
                      className="flex justify-between gap-2 border-b border-slate-100 pb-2"
                    >
                      <span className="text-slate-700">
                        {name} → {p.destination}
                      </span>
                      <span className="font-medium text-slate-900">
                        ₹{p.amount}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
