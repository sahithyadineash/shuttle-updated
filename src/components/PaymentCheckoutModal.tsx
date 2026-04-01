import type { PaymentDoc } from "../types/models"

type Props = {
  open: boolean
  step: "checkout" | "receipt"
  destination: string
  shuttleLabel: string
  amount: number
  submitting: boolean
  error: string | null
  receipt: PaymentDoc | null
  onClose: () => void
  onPay: () => void
}

export default function PaymentCheckoutModal({
  open,
  step,
  destination,
  shuttleLabel,
  amount,
  submitting,
  error,
  receipt,
  onClose,
  onPay,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        {step === "checkout" && (
          <>
            <h2 id="payment-modal-title" className="text-lg font-semibold text-slate-900">
              Pay for your ride
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Demo checkout — confirm payment to complete your booking (₹{amount}).
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p>
                <span className="text-slate-500">Shuttle</span>{" "}
                <span className="font-medium text-slate-900">{shuttleLabel}</span>
              </p>
              <p className="mt-1">
                <span className="text-slate-500">To</span>{" "}
                <span className="font-medium text-slate-900">{destination}</span>
              </p>
              <p className="mt-2 text-base font-semibold text-teal-800">
                Total ₹{amount}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-600">
              <p className="font-medium text-slate-800">VIT Shuttle Pay (demo)</p>
              <p className="mt-1 text-xs">UPI / Card simulated — no real charge.</p>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-700">{error}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onPay}
                disabled={submitting}
                className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                {submitting ? "Processing…" : `Pay ₹${amount}`}
              </button>
            </div>
          </>
        )}

        {step === "receipt" && receipt && (
          <>
            <h2 id="payment-modal-title" className="text-lg font-semibold text-emerald-900">
              Payment successful
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Your ride is booked. Keep this reference for the driver if needed.
            </p>

            <div className="mt-4 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p>
                <span className="text-slate-600">Receipt ID</span>
                <br />
                <span className="font-mono font-medium text-slate-900">{receipt._id}</span>
              </p>
              <p>
                <span className="text-slate-600">Amount</span>
                <br />
                <span className="font-semibold">₹{receipt.amount}</span>
              </p>
              <p>
                <span className="text-slate-600">Destination</span>
                <br />
                <span className="font-medium">{receipt.destination}</span>
              </p>
              <p>
                <span className="text-slate-600">Time</span>
                <br />
                <span className="text-slate-800">
                  {receipt.createdAt
                    ? new Date(receipt.createdAt).toLocaleString()
                    : "—"}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}
