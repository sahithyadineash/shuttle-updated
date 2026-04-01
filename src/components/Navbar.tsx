import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const displayName = user?.name ?? "Account"
  const homePath = user?.role === "driver" ? "/driver" : "/dashboard"
  const isDriver = user?.role === "driver"

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate("/", { replace: true })
  }

  const showBack =
    location.pathname === "/profile" ||
    location.pathname === "/history" ||
    location.pathname.startsWith("/shuttle/")

  return (
    <header className="relative z-[1000] flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3 text-white shadow-md md:px-6">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(homePath)}
            className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(homePath)}
          className="text-left text-lg font-semibold tracking-tight"
        >
          🚐 Shuttle Tracker
        </button>

        {isDriver && (
          <>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
            >
              Live map
            </button>
            <button
              type="button"
              onClick={() => navigate("/driver")}
              className="rounded-lg bg-teal-800 px-3 py-1.5 text-sm hover:bg-teal-700"
            >
              Driver
            </button>
          </>
        )}

        {!isDriver && (
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="hidden rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600 sm:inline"
          >
            History
          </button>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-800"
        >
          <span className="max-w-[140px] truncate text-sm">{displayName}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm">
            👤
          </span>
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-[1001] w-48 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-lg">
            <button
              type="button"
              className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50"
              onClick={() => {
                setOpen(false)
                navigate("/profile")
              }}
            >
              Profile
            </button>
            {!isDriver && (
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 sm:hidden"
                onClick={() => {
                  setOpen(false)
                  navigate("/history")
                }}
              >
                Payment history
              </button>
            )}
            <button
              type="button"
              className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
