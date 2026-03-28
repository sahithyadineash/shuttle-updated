import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

// Fix marker icons
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

  // 📍 Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {
        // fallback location
        setUserLocation({ lat: 13.0827, lng: 80.2707 })
      }
    )
  }, [])

  // 🚐 Mock shuttle data
  useEffect(() => {
    setTimeout(() => {
      setShuttles([
        {
          shuttle_number: "SH-01",
          seats: "available",
          current_location: { lat: 13.0827, lng: 80.2707 },
          route: "Main Gate, Mens Hostel",
        },
        {
          shuttle_number: "SH-02",
          seats: "full",
          current_location: { lat: 13.07, lng: 80.25 },
          route: "Main Gate, Girls Hostel, TT, SJT, PRP, MGB",
        },
        {
          shuttle_number: "SH-03",
          seats: "available",
          current_location: { lat: 13.05, lng: 80.28 },
          route: "Main Gate, Mens Hostel",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  // 📏 Distance (Haversine)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // ⏱ ETA (avg speed = 25 km/h)
  const getETA = (distance: number) => {
    return Math.round((distance / 25) * 60)
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* 🗺️ MAP */}
      <div style={{ flex: 2 }}>
        <MapContainer
          center={[13.0827, 80.2707]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {shuttles.map((s, i) => (
            <Marker
              key={i}
              position={[
                s.current_location.lat,
                s.current_location.lng,
              ]}
            >
              <Popup>
                <b>{s.shuttle_number}</b><br />
                {s.route}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 🚐 RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          background: "#f1f5f9",
          overflowY: "auto",
        }}
      >
        <h2>🚐 Shuttles</h2>

        {loading || !userLocation ? (
          <p>Loading...</p>
        ) : (
          shuttles.map((s, index) => {
            const distance = getDistance(
              userLocation.lat,
              userLocation.lng,
              s.current_location.lat,
              s.current_location.lng
            )

            const eta = getETA(distance)

            return (
              <div
                key={index}
                style={{
                  background: "white",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "12px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
              >
                <h3>{s.shuttle_number}</h3>

                <p><b>Route:</b> {s.route}</p>

                <p>
                  <b>Seats:</b>{" "}
                  <span
                    style={{
                      color: s.seats === "available" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {s.seats === "available" ? "Available" : "Full"}
                  </span>
                </p>

                <p>📍 {distance.toFixed(2)} km away</p>
                <p>⏱ {eta} mins away</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Dashboard