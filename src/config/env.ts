/**
 * REST API base path for axios.
 * - Dev (no VITE_API_URL): `/api` → Vite proxies to backend (same origin, no CORS issues).
 * - With VITE_API_URL: full URL to backend, e.g. http://127.0.0.1:5001/api
 */
export function getRestApiBase(): string {
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (raw) {
    const base = raw.replace(/\/$/, "")
    return `${base}/api`
  }
  return "/api"
}

/**
 * Origin for Socket.io only (no /api path).
 * - Dev without VITE_API_URL: use current page origin so Vite can proxy /socket.io.
 * - With VITE_API_URL: connect straight to that backend.
 */
export function getSocketOrigin(): string {
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (raw) return raw.replace(/\/$/, "")
  if (typeof window !== "undefined") return window.location.origin
  return "http://localhost:5173"
}

/** Same-origin `/api/routing` (Vite proxy) or backend `/api/routing` when using `VITE_API_URL`. */
export function getRoutingApiBase(): string {
  const base = getRestApiBase()
  if (base.startsWith("http")) {
    return `${base.replace(/\/api$/, "")}/api/routing`
  }
  return "/api/routing"
}
