export interface Stop {
  name: string
  lat: number
  lng: number
  order: number
}

export interface RouteSchedule {
  start_time?: string
  end_time?: string
  frequency_minutes?: number
}

export interface RouteDoc {
  _id: string
  route_name: string
  stops: Stop[]
  schedule?: RouteSchedule
}

export interface ShuttleDoc {
  _id: string
  shuttle_number: string
  route_id: RouteDoc | null
  current_location: { lat: number; lng: number }
  seats_total: number
  seats_available: number
  /** Driver toggle — primary visibility for students. */
  seat_status?: "available" | "full"
  status: "active" | "inactive" | string
}

export interface LocationUpdatedPayload {
  shuttle_id: string
  lat: number
  lng: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
}

export interface PaymentDoc {
  _id: string
  user_id:
    | string
    | { _id?: string; name?: string; email?: string }
    | null
  shuttle_id?:
    | string
    | { _id?: string; shuttle_number?: string }
    | null
  route_id?: string | { _id?: string; route_name?: string } | null
  destination?: string
  amount: number
  status?: "pending" | "paid" | "failed" | "cancelled" | string
  createdAt?: string
}
