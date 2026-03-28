import { useEffect, useState } from "react"

function Profile() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 🔥 TEMP DATA (replace with backend later)
    setUser({
      name: "Sanjusree",
      email: "sanju@gmail.com",
      phone: "9876543210",
      role: "Student",
    })
  }, [])

  if (!user) return <p style={{ padding: "20px" }}>Loading...</p>

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          padding: "25px",
          textAlign: "center",
        }}
      >
        {/* 👤 Avatar */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#0f766e",
            color: "white",
            fontSize: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 15px",
          }}
        >
          {user.name.charAt(0)}
        </div>

        <h2 style={{ marginBottom: "5px" }}>{user.name}</h2>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          {user.role}
        </p>

        {/* INFO SECTION */}
        <div style={{ textAlign: "left" }}>
          <ProfileItem label="Email" value={user.email} />
          <ProfileItem label="Phone" value={user.phone} />
        </div>

        {/* BUTTON */}
        <button
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            background: "#0f766e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}

export default Profile

// 🔹 Reusable Item Component
function ProfileItem({ label, value }: any) {
  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        background: "#f8fafc",
        borderRadius: "8px",
      }}
    >
      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontWeight: "bold" }}>{value}</p>
    </div>
  )
}