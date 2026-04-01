import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../lib/api"
import { useSocket } from "../hooks/useSocket"
import type { LocationUpdatedPayload, RouteDoc, ShuttleDoc } from "../types/models"
import ShuttleMap from "../components/map/ShuttleMap"
import { VIT_CAMPUS_CENTER } from "../config/constants"
import { shuttleSeatLabel } from "../lib/shuttleDisplay"
import { distanceKm, etaMinutes } from "../lib/geo"
import { isAxiosError } from "axios"

function isRoutePopulated(
  r: ShuttleDoc["route_id"]
): r is RouteDoc {
  return r !== null && typeof r === "object" && "_id" in r
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { socket, connected } = useSocket()

  const [routes, setRoutes] = useState<RouteDoc[]>([])
  const [shuttles, setShuttles] = useState<ShuttleDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeFilter, setRouteFilter] = useState<string>("")
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [selectedShuttleId, setSelectedShuttleId] = useState<string | null>(
    null
  )

  const loadData = useCallback(async () => {
    setError(null)
    try {
      const [rRes, sRes] = await Promise.all([
        api.get<RouteDoc[]>("/routes"),
        api.get<ShuttleDoc[]>("/shuttles"),
      ])
      setRoutes(rRes.data)
      setShuttles(sRes.data)
    } catch (e) {
      const msg = isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Failed to load data"
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
      },
      () => {
        setUserPos([VIT_CAMPUS_CENTER[0], VIT_CAMPUS_CENTER[1]])
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }, [])

  useEffect(() => {
    const onLocation = (data: LocationUpdatedPayload) => {
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

    socket.on("location-updated", onLocation)
    return () => {
      socket.off("location-updated", onLocation)
    }
  }, [socket])

  const filteredShuttles = useMemo(() => {
    if (!routeFilter) return shuttles
    return shuttles.filter((s) => {
      if (!isRoutePopulated(s.route_id)) return false
      return String(s.route_id._id) === routeFilter
    })
  }, [shuttles, routeFilter])

  const nearest = useMemo(() => {
    if (!userPos || filteredShuttles.length === 0) return null
    let best = filteredShuttles[0]
    let bestD = distanceKm(
      userPos[0],
      userPos[1],
      best.current_location.lat,
      best.current_location.lng
    )
    for (let i = 1; i < filteredShuttles.length; i++) {
      const s = filteredShuttles[i]
      const d = distanceKm(
        userPos[0],
        userPos[1],
        s.current_location.lat,
        s.current_location.lng
      )
      if (d < bestD) {
        best = s
        bestD = d
      }
    }
    return best
  }, [filteredShuttles, userPos])

  const goToShuttle = (id: string) => {
    navigate(`/shuttle/${id}`)
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-slate-100">
      <header className="flex flex-shrink-0 flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Live shuttle map
          </h1>
          <p className="text-sm text-slate-500">
            Tap a shuttle to open its route and book a destination (₹20).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                connected ? "bg-emerald-500" : "bg-amber-500"
              }`}
              title={connected ? "Socket connected" : "Reconnecting…"}
            />
            <span className="text-slate-600">
              {connected ? "Live" : "Connecting…"}
            </span>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="whitespace-nowrap">Route</span>
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
            >
              <option value="">All routes</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.route_name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => loadData()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="relative min-h-[320px] flex-1 lg:min-h-0">
          {loading ? (
            <div className="flex h-full items-center justify-center bg-slate-200/60">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
            </div>
          ) : (
            <ShuttleMap
              shuttles={filteredShuttles}
              routes={routes}
              userPosition={userPos}
              selectedShuttleId={selectedShuttleId}
              onSelectShuttle={setSelectedShuttleId}
              onOpenShuttle={goToShuttle}
            />
          )}
        </section>

        <aside className="flex w-full flex-col border-t border-slate-200 bg-white lg:w-[400px] lg:border-l lg:border-t-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Shuttles</h2>
            <p className="text-xs text-slate-500">
              Open a shuttle to see stops, pick a destination, and pay ₹20.
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {!userPos && !loading && (
              <p className="text-sm text-slate-500">Locating you…</p>
            )}

            {filteredShuttles.map((s) => {
              const isSel = selectedShuttleId === s._id
              const isNear = nearest?._id === s._id
              const seatWord = shuttleSeatLabel(s)
              const isFull = seatWord === "Full"
              const shortId = s._id.slice(-6).toUpperCase()
              let dist = 0
              let eta = 0
              if (userPos) {
                dist = distanceKm(
                  userPos[0],
                  userPos[1],
                  s.current_location.lat,
                  s.current_location.lng
                )
                eta = etaMinutes(dist)
              }

              return (
                <article
                  key={s._id}
                  className={`rounded-xl border p-4 shadow-sm transition ${
                    isSel
                      ? "border-teal-600 ring-2 ring-teal-600/20"
                      : "border-slate-200"
                  } ${
                    isNear && !isFull
                      ? "bg-emerald-50/80"
                      : isNear && isFull
                        ? "bg-red-50/80"
                        : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {s.shuttle_number}
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          …{shortId}
                        </span>
                        {isNear && (
                          <span
                            className={`ml-2 text-xs font-normal ${
                              isFull ? "text-red-700" : "text-emerald-700"
                            }`}
                          >
                            Nearest
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {isRoutePopulated(s.route_id)
                          ? s.route_id.route_name
                          : "Route"}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === "active"
                            ? "bg-slate-100 text-slate-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {s.status}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isFull
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {seatWord}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-xs text-slate-500">Seats (driver)</p>
                      <p
                        className={`font-medium ${
                          isFull ? "text-red-700" : "text-slate-900"
                        }`}
                      >
                        {seatWord}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-xs text-slate-500">ETA to shuttle</p>
                      <p className="font-medium text-slate-900">
                        {userPos ? `~${eta} min` : "—"}{" "}
                        <span className="text-slate-500">
                          ({userPos ? `${dist.toFixed(2)} km` : "—"})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedShuttleId(s._id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    >
                      Focus on map
                    </button>
                    <button
                      type="button"
                      onClick={() => goToShuttle(s._id)}
                      className={
                        isFull
                          ? "rounded-lg border-2 border-red-600 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
                          : "rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
                      }
                    >
                      Route & book
                    </button>
                  </div>
                </article>
              )
            })}

            {!loading && filteredShuttles.length === 0 && (
              <p className="text-sm text-slate-500">
                No shuttles match this filter.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
