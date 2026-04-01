import type { ShuttleDoc } from "../types/models"

/** Driver-reported status; legacy docs fall back to seats_available. */
export function shuttleSeatLabel(s: ShuttleDoc): "Available" | "Full" {
  if (s.seat_status === "full") return "Full"
  if (s.seat_status === "available") return "Available"
  return (s.seats_available ?? 0) >= 1 ? "Available" : "Full"
}

export function isShuttleBookable(s: ShuttleDoc): boolean {
  if (s.status !== "active") return false
  return shuttleSeatLabel(s) === "Available"
}
