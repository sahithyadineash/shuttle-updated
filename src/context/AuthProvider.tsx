import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { api, setAuthToken } from "../lib/api"
import type { AuthUser } from "../types/models"
import { AuthContext, type RegisterPayload } from "./auth-context"

const STORAGE_TOKEN = "token"
const STORAGE_USER = "user"

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) return null
  try {
    const u = JSON.parse(raw) as AuthUser & { id?: string }
    if (!u?.email) return null
    return {
      id: String(u.id),
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone ?? "",
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_TOKEN)
  )
  const [user, setUser] = useState<AuthUser | null>(() =>
    parseStoredUser(localStorage.getItem(STORAGE_USER))
  )
  const [loading] = useState(false)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{
      token: string
      user: AuthUser & { phone?: string }
    }>("/auth/login", { email, password })
    const t = data.token
    const u: AuthUser = {
      id: String(data.user.id),
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      phone: data.user.phone ?? "",
    }
    localStorage.setItem(STORAGE_TOKEN, t)
    localStorage.setItem(STORAGE_USER, JSON.stringify(u))
    setToken(t)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post("/auth/register", payload)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    setToken(null)
    setUser(null)
    setAuthToken(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
