import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { useAuth } from "../hooks/useAuth"
import type { PaymentDoc } from "../types/models"
import { isAxiosError } from "axios"

function shuttleLabel(p: PaymentDoc): string {
  const s = p.shuttle_id
  if (s && typeof s === "object" && "shuttle_number" in s && s.shuttle_number) {
    return s.shuttle_number
  }
  return ""
}

function routeLabel(p: PaymentDoc): string {
  const r = p.route_id
  if (r && typeof r === "object" && "route_name" in r && r.route_name) {
    return r.route_name
  }
  return ""
}

function statusStyle(status: string | undefined) {
  const s = (status ?? "").toLowerCase()
  if (s === "paid")
    return "bg-emerald-100 text-emerald-800"
  if (s === "pending")
    return "bg-amber-100 text-amber-900"
  if (s === "failed" || s === "cancelled")
    return "bg-red-100 text-red-800"
  return "bg-slate-200 text-slate-800"
}

export default function PaymentHistory() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<PaymentDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = user?.id
    if (!userId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get<PaymentDoc[]>(`/payments/user/${userId}`)
        if (!cancelled) setPayments(data)
      } catch (e) {
        const msg = isAxiosError(e)
          ? e.response?.data?.message ?? e.message
          : "Could not load payments"
        if (!cancelled) setError(String(msg))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return (
    <div className="min-h-full flex-1 bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">
          Payments &amp; requests
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pending requests, completed ₹20 ride payments, and failed attempts are
          stored in your account.
        </p>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && payments.length === 0 && (
          <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-slate-600">
            No payments yet. Book from a shuttle&apos;s route page to create a
            ₹20 payment.
          </p>
        )}

        <ul className="mt-6 space-y-3">
          {payments.map((p) => (
            <li
              key={p._id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  ₹{p.amount}
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {p.destination ?? "Shuttle ride"}
                </p>
                <p className="text-xs text-slate-500">
                  {shuttleLabel(p) && (
                    <span>Shuttle {shuttleLabel(p)} · </span>
                  )}
                  {routeLabel(p) && <span>{routeLabel(p)} · </span>}
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <span
                className={`self-start rounded-full px-3 py-1 text-xs font-semibold capitalize sm:self-center ${statusStyle(p.status)}`}
              >
                {p.status ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
