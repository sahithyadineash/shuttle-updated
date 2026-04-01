import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const user = {
    name: localStorage.getItem("studentName") || "Sanjusree",
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("studentName")
    navigate("/")
  }

  return (
    <div
      style={{
        padding: "15px 25px",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        zIndex: 9999, // ✅ FIXED
      }}
    >
      {/* LEFT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        
        {/* BACK BUTTON */}
        {(location.pathname === "/profile" ||
          location.pathname === "/history") && (
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "#334155",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ⬅ Back
          </button>
        )}

        {/* TITLE */}
        <h2
          style={{ margin: 0, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          🚐 Shuttle Track
        </h2>

        {/* HISTORY BUTTON */}
        <button
          onClick={() => navigate("/history")}
          style={{
            background: "#334155",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          💳 History
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ position: "relative", zIndex: 10001 }}>
        <div
          onClick={() => setOpen(!open)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>{user.name}</span>

          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              background: "#334155",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            👤
          </div>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50px",
              background: "white",
              color: "black",
              borderRadius: "8px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              width: "150px",
              zIndex: 10000, // ✅ FIXED
            }}
          >
            <div
              style={itemStyle}
              onClick={() => {
                setOpen(false)
                navigate("/profile")
              }}
            >
              👤 Details
            </div>

            <div
              style={itemStyle}
              onClick={() => {
                setOpen(false)
                navigate("/history")
              }}
            >
              💳 Payments
            </div>

            <div
              style={{ ...itemStyle, color: "red", borderBottom: "none" }}
              onClick={handleLogout}
            >
              🚪 Logout
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar

const itemStyle = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #eee",
}