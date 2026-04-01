import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

/** Only drivers; others go to student map. */
export default function DriverRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (user?.role !== "driver") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
