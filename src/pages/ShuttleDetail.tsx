import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet"
import L from "leaflet"
import { api } from "../lib/api"
import { useSocket } from "../hooks/useSocket"
import type { LocationUpdatedPayload, PaymentDoc, RouteDoc, ShuttleDoc, Stop } from "../types/models"
import { VIT_MAP_DEFAULTS } from "../config/constants"
import { isShuttleBookable, shuttleSeatLabel } from "../lib/shuttleDisplay"
import PaymentCheckoutModal from "../components/PaymentCheckoutModal"
import RoadRoutePolylines from "../components/map/RoadRoutePolylines"
import { shuttleBusDivIcon } from "../lib/shuttleMapIcon"
import { isAxiosError } from "axios"

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function isRoute(r: ShuttleDoc["route_id"]): r is RouteDoc {
  return r !== null && typeof r === "object" && "stops" in r
}

export default function ShuttleDetail() {
  const { shuttleId } = useParams<{ shuttleId: string }>()
  const navigate = useNavigate()
  const { socket } = useSocket()

  const [shuttle, setShuttle] = useState<ShuttleDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<"checkout" | "receipt">("checkout")
  const [modalError, setModalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<PaymentDoc | null>(null)

  const loadShuttle = useCallback(async () => {
    if (!shuttleId) return
    setError(null)
    try {
      const { data } = await api.get<ShuttleDoc>(`/shuttles/${shuttleId}`)
      setShuttle(data)
    } catch (e) {
      const msg = isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Failed to load shuttle"
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }, [shuttleId])

  useEffect(() => {
    loadShuttle()
  }, [loadShuttle])

  useEffect(() => {
    if (!socket || !shuttleId) return
    const onLoc = (data: LocationUpdatedPayload) => {
      if (String(data.shuttle_id) !== String(shuttleId)) return
      setShuttle((prev) =>
        prev
          ? {
              ...prev,
              current_location: { lat: data.lat, lng: data.lng },
            }
          : prev
      )
    }
    socket.on("location-updated", onLoc)
    return () => {
      socket.off("location-updated", onLoc)
    }
  }, [socket, shuttleId])

  const sortedStops = useMemo(() => {
    if (!shuttle || !isRoute(shuttle.route_id)) return []
    return [...shuttle.route_id.stops].sort((a, b) => a.order - b.order)
  }, [shuttle])

  const mapCenter = useMemo((): [number, number] => {
    if (shuttle) {
      return [shuttle.current_location.lat, shuttle.current_location.lng]
    }
    return [...VIT_MAP_DEFAULTS.center]
  }, [shuttle])

  const busIcon = useMemo(() => {
    const full = shuttle ? shuttleSeatLabel(shuttle) === "Full" : false
    return shuttleBusDivIcon({ full })
  }, [shuttle])

  const openPaymentModal = () => {
    if (!shuttle || !selectedStop || !isRoute(shuttle.route_id)) {
      setError("Select a destination stop.")
      return
    }
    if (!isShuttleBookable(shuttle)) {
      setError("This shuttle is full or inactive.")
      return
    }
    setError(null)
    setModalError(null)
    setReceipt(null)
    setModalStep("checkout")
    setModalOpen(true)
  }

  const handlePay = async () => {
    if (!shuttle || !selectedStop || !isRoute(shuttle.route_id)) return
    setSubmitting(true)
    setModalError(null)
    try {
      const { data } = await api.post<PaymentDoc>("/payments/book", {
        shuttle_id: shuttle._id,
        route_id: shuttle.route_id._id,
        destination: selectedStop.name,
      })
      setReceipt(data)
      setModalStep("receipt")
      await loadShuttle()
    } catch (e) {
      const msg = isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Payment failed"
      setModalError(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
    setModalStep("checkout")
    setModalError(null)
    if (modalStep === "receipt") {
      setReceipt(null)
      setSelectedStop(null)
    }
  }

  const finalizeReceiptClose = () => {
    setModalOpen(false)
    setModalStep("checkout")
    setModalError(null)
    setReceipt(null)
    setSelectedStop(null)
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-100 p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
      </div>
    )
  }

  if (error && !shuttle) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-100 p-8">
        <p className="text-red-800">{error}</p>
        <Link
          to="/dashboard"
          className="rounded-lg bg-teal-700 px-4 py-2 text-white"
        >
          Back to map
        </Link>
      </div>
    )
  }

  if (!shuttle) return null

  const route = isRoute(shuttle.route_id) ? shuttle.route_id : null
  const seatWord = shuttleSeatLabel(shuttle)
  const canBook = isShuttleBookable(shuttle)
  const shortId = shuttle._id.slice(-6).toUpperCase()

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-100">
      <PaymentCheckoutModal
        open={modalOpen}
        step={modalStep}
        destination={selectedStop?.name ?? ""}
        shuttleLabel={`${shuttle.shuttle_number} · …${shortId}`}
        amount={20}
        submitting={submitting}
        error={modalError}
        receipt={receipt}
        onClose={modalStep === "receipt" ? finalizeReceiptClose : closeModal}
        onPay={handlePay}
      />

      <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-2 text-sm text-teal-700 hover:underline"
            >
              ← Back to live map
            </button>
            <h1 className="text-xl font-semibold text-slate-900">
              {shuttle.shuttle_number}{" "}
              <span className="text-sm font-normal text-slate-500">
                · ID …{shortId}
              </span>
            </h1>
            <p className="text-sm text-slate-600">
              {route?.route_name ?? "Route"} · Seats:{" "}
              <span
                className={`font-medium ${
                  seatWord === "Full" ? "text-red-700" : "text-slate-900"
                }`}
              >
                {seatWord}
              </span>{" "}
              · {shuttle.status}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 lg:flex-row">
        <section className="min-h-[280px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:min-h-[420px]">
          <MapContainer
            center={mapCenter}
            zoom={15}
            className="h-[320px] w-full lg:h-full lg:min-h-[420px]"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {route && (
              <RoadRoutePolylines
                routes={[route]}
                colors={["#0d9488"]}
                opacity={0.7}
                weight={5}
              />
            )}
            {sortedStops.map((s) => (
              <CircleMarker
                key={`${s.order}-${s.name}`}
                center={[s.lat, s.lng]}
                radius={6}
                pathOptions={{
                  color: selectedStop?.name === s.name ? "#ea580c" : "#0f766e",
                  fillColor: "#fff",
                  weight: 2,
                }}
              >
                <Popup>{s.name}</Popup>
              </CircleMarker>
            ))}
            <Marker
              position={[
                shuttle.current_location.lat,
                shuttle.current_location.lng,
              ]}
              icon={busIcon}
            >
              <Popup>
                {shuttle.shuttle_number} (…{shortId})
              </Popup>
            </Marker>
          </MapContainer>
        </section>

        <aside className="w-full flex-shrink-0 lg:w-[380px]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Choose destination</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a stop, then open the payment screen. Your booking is only
              saved after you tap Pay ₹20 in the popup.
            </p>

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            {!route || sortedStops.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No stops on this route. Run{" "}
                <code className="rounded bg-slate-100 px-1">npm run seed:vit-route</code>{" "}
                in the backend folder, then assign this route to the shuttle in
                MongoDB.
              </p>
            ) : (
              <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                {sortedStops.map((stop) => (
                  <li key={`${stop.order}-${stop.name}`}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                      <input
                        type="radio"
                        name="dest"
                        className="mt-1"
                        checked={selectedStop?.name === stop.name}
                        disabled={modalOpen}
                        onChange={() => setSelectedStop(stop)}
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {stop.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Order {stop.order}
                        </p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              disabled={
                !selectedStop ||
                !canBook ||
                modalOpen ||
                submitting
              }
              onClick={openPaymentModal}
              className="mt-5 w-full rounded-lg bg-teal-700 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to payment
            </button>
            {!canBook && (
              <p className="mt-2 text-xs text-amber-800">
                Shuttle is full or inactive — driver must mark seats available
                before new bookings.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
