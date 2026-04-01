import { createContext } from "react"
import type { AuthUser } from "../types/models"

export type RegisterPayload = {
  name: string
  email: string
  password: string
  role: string
  phone: string
}

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
