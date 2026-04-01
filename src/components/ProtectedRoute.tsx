import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <>{children}</>
}
