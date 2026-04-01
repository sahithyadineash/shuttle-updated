import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(true)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "student",
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      const url = isRegister
        ? "http://localhost:5001/api/auth/register"
        : "http://localhost:5001/api/auth/login"

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        if (!isRegister) {
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data.user)) // ADD THIS
          navigate("/dashboard")
        } else {
          alert("Registered! Please login.")
          setIsRegister(false)
        }
      } else {
        alert(data.message || "Error")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🚐</div>

        <h2>{isRegister ? "Create Account" : "Login"}</h2>
        <p style={{ color: "#666" }}>
          {isRegister ? "Join ShuttleTrack today" : "Welcome back"}
        </p>

        {isRegister && (
          <input
            name="name"
            placeholder="Full Name"
            style={styles.input}
            onChange={handleChange}
          />
        )}

        <input
          name="email"
          placeholder="Email"
          style={styles.input}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          style={styles.input}
          onChange={handleChange}
        />

        {isRegister && (
          <>
            <input
              name="phone"
              placeholder="Phone Number"
              style={styles.input}
              onChange={handleChange}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={
                  form.role === "student"
                    ? styles.roleActive
                    : styles.roleBtn
                }
                onClick={() => setForm({ ...form, role: "student" })}
              >
                Student
              </button>

              <button
                style={
                  form.role === "driver"
                    ? styles.roleActive
                    : styles.roleBtn
                }
                onClick={() => setForm({ ...form, role: "driver" })}
              >
                Driver
              </button>
            </div>
          </>
        )}

        <button style={styles.mainBtn} onClick={handleSubmit}>
          {isRegister ? "Create Account" : "Login"}
        </button>

        <p style={{ marginTop: "10px" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            style={{ color: "#0f766e", cursor: "pointer" }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Sign In" : "Register"}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login

// 🎨 STYLES
const styles: any = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
  },
  card: {
    width: "350px",
    padding: "25px",
    borderRadius: "10px",
    background: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  logo: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  mainBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  roleBtn: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "white",
    cursor: "pointer",
  },
  roleActive: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    background: "#0f766e",
    color: "white",
    border: "none",
  },
}