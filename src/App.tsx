import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Dashboard from "./pages/Dashboard"
import PaymentHistory from "./pages/PaymentHistory"
import MainLayout from "./layouts/MainLayout"

function App() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

      {/* Profile */}
      <Route path="/profile" element={<MainLayout />}>
        <Route index element={<Profile />} />
      </Route>

      {/* ✅ Payment History (ADD THIS) */}
      <Route path="/history" element={<MainLayout />}>
        <Route index element={<PaymentHistory />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}

export default App