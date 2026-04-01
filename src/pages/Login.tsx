import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { isAxiosError } from "axios"
function formatAuthError(err: unknown): string {
  if (!isAxiosError(err)) {
    return err instanceof Error ? err.message : "Something went wrong"
  }
  const code = err.code
  if (
    code === "ERR_NETWORK" ||
    err.message === "Network Error" ||
    (!err.response && err.request)
  ) {
    const hint =
      import.meta.env.VITE_API_URL?.trim() &&
      import.meta.env.VITE_API_URL.includes("localhost")
        ? " If the backend is running, try VITE_API_URL=http://127.0.0.1:5001 or remove it to use the Vite proxy."
        : " Start the API on port 5001 (backend folder) and open the app from the Vite URL (usually http://localhost:5173)."
    return `Cannot reach the server (network error).${hint}`
  }
  const data = err.response?.data as { message?: string; error?: string }
  return String(data?.message ?? data?.error ?? err.message)
}

export default function Login() {
  const navigate = useNavigate()
  const { user, token, login, register } = useAuth()

  const [isRegister, setIsRegister] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "student",
  })

  if (token && user) {
    return (
      <Navigate
        to={user.role === "driver" ? "/driver" : "/dashboard"}
        replace
      />
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isRegister) {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone,
        })
        setIsRegister(false)
        setError(null)
      } else {
        const loggedIn = await login(form.email, form.password)
        navigate(loggedIn.role === "driver" ? "/driver" : "/dashboard", {
          replace: true,
        })
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200/80">
        <div className="mb-6 text-center">
          <div className="text-4xl" aria-hidden>
            🚐
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {isRegister ? "Create account" : "VIT Shuttle Tracker"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRegister
              ? "Join with your campus email"
              : "Sign in to track shuttles in real time"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Full name
              </label>
              <input
                name="name"
                required
                autoComplete="name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                  placeholder="+91 …"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "student" })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    form.role === "student"
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "driver" })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    form.role === "driver"
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Driver
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Please wait…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            className="font-semibold text-teal-700 hover:underline"
            onClick={() => {
              setError(null)
              setIsRegister(!isRegister)
            }}
          >
            {isRegister ? "Sign in" : "Register"}
          </button>
        </p>
      </div>
    </div>
  )
}
