import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthProvider"
import { SocketProvider } from "./context/SocketProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Dashboard from "./pages/Dashboard"
import PaymentHistory from "./pages/PaymentHistory"
import ShuttleDetail from "./pages/ShuttleDetail"
import DriverDashboard from "./pages/DriverDashboard"
import DriverRoute from "./components/DriverRoute"
import MainLayout from "./layouts/MainLayout"

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
          </Route>

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PaymentHistory />} />
          </Route>

          <Route
            path="/shuttle/:shuttleId"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ShuttleDetail />} />
          </Route>

          <Route
            path="/driver"
            element={
              <ProtectedRoute>
                <DriverRoute>
                  <MainLayout />
                </DriverRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<DriverDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
