import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { io } from "socket.io-client"

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
})

function Dashboard() {
  const [shuttles, setShuttles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [destination, setDestination] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [socket, setSocket] = useState<any>(null)

  // 📍 User location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {
        setUserLocation({ lat: 12.9716, lng: 79.1588 })
      }
    )
  }, [])

  // 🚐 Fetch shuttles
  useEffect(() => {
    fetch("http://localhost:5001/api/shuttles")
      .then(res => res.json())
      .then(data => {
        setShuttles(data)
        setLoading(false)
      })
  }, [])

  // 🔌 Socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5001")

    newSocket.on("connect", () => {
      console.log("✅ Connected:", newSocket.id)
    })

    setSocket(newSocket)

    return () => newSocket.disconnect()
  }, [])

  // 📡 Live updates
  useEffect(() => {
    if (!socket) return

    socket.on("location-updated", (data: any) => {
      console.log("📡 Live:", data)

      setShuttles((prev: any[]) =>
        prev.map((s) =>
          s._id === data.shuttle_id
            ? {
                ...s,
                current_location: {
                  lat: data.lat,
                  lng: data.lng,
                },
              }
            : s
        )
      )
    })

    return () => socket.off("location-updated")
  }, [socket])

  // 📏 Distance
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const getETA = (distance: number) => Math.round((distance / 25) * 60)

  // 🎯 Filter
  const filteredShuttles = useMemo(() => {
    return shuttles.filter((s) => {
      if (!destination) return true
      const routeName = s.route_id?.route_name || ""

      if (destination === "Mens Hostel") {
        return routeName.includes("Mens Hostel")
      }

      if (destination === "Academic Blocks") {
        return routeName.includes("TT") || routeName.includes("SJT")
      }

      return true
    })
  }, [shuttles, destination])

  // ⭐ Nearest shuttle
  const nearestShuttle = useMemo(() => {
    if (!userLocation || filteredShuttles.length === 0) return null

    let nearest = filteredShuttles[0]
    let minDistance = getDistance(
      userLocation.lat,
      userLocation.lng,
      nearest.current_location.lat,
      nearest.current_location.lng
    )

    filteredShuttles.forEach((s) => {
      const d = getDistance(
        userLocation.lat,
        userLocation.lng,
        s.current_location.lat,
        s.current_location.lng
      )

      if (d < minDistance) {
        minDistance = d
        nearest = s
      }
    })

    return nearest
  }, [filteredShuttles, userLocation])

  // 💳 Payment popup
  useEffect(() => {
    if (!nearestShuttle || !userLocation) return

    const distance = getDistance(
      userLocation.lat,
      userLocation.lng,
      nearestShuttle.current_location.lat,
      nearestShuttle.current_location.lng
    )

    if (getETA(distance) <= 1) {
      setShowPayment(true)
    }
  }, [nearestShuttle, userLocation])

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* TOP BAR */}
      <div style={{
        padding: "15px",
        background: "#e2e8f0",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <h3>Select Destination</h3>

        <select value={destination} onChange={(e) => setDestination(e.target.value)}>
          <option value="">-- Choose Destination --</option>
          <option value="Mens Hostel">Men's Hostel</option>
          <option value="Academic Blocks">Academic Blocks</option>
        </select>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        
        {/* MAP */}
        <div style={{ flex: 2 }}>
          <MapContainer center={[12.9716, 79.1588]} zoom={16} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {filteredShuttles.map((s, i) => (
              <Marker key={i} position={[s.current_location.lat, s.current_location.lng]}>
                <Popup>
                  <b>{s.shuttle_number}</b>
                  <br />
                  {s.route_id?.route_name || "Route info"}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* RIGHT PANEL (YOUR ORIGINAL STYLE) */}
        <div style={{
          flex: 1,
          padding: "20px",
          background: "#f1f5f9",
          overflowY: "auto",
        }}>
          <h2>Available Shuttles</h2>

          {loading || !userLocation ? (
            <p>Loading...</p>
          ) : (
            filteredShuttles.map((s, index) => {
              const distance = getDistance(
                userLocation.lat,
                userLocation.lng,
                s.current_location.lat,
                s.current_location.lng
              )

              const eta = getETA(distance)
              const isNearest =
                nearestShuttle?._id === s._id

              return (
                <div
                  key={index}
                  style={{
                    background: isNearest ? "#dcfce7" : "white",
                    border: isNearest ? "2px solid green" : "none",
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "12px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  }}
                >
                  <h3>
                    {s.shuttle_number} {isNearest && "⭐"}
                  </h3>

                  <p>{s.route_id?.route_name || "Route info"}</p>
                  <p>📍 {distance.toFixed(2)} km away</p>
                  <p>⏱ {eta} mins away</p>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard