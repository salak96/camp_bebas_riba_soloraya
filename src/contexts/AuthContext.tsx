import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, clearToken, toProfile, type Profile, type User } from "@/lib/api"

type AuthContextType = {
  session: { user: User } | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshAuth() {
    try {
      const data = await api<{ user: User | null }>("/auth/me")
      setUser(data.user)
    } catch {
      clearToken()
      setUser(null)
    }
  }

  useEffect(() => {
    refreshAuth().finally(() => setLoading(false))
  }, [])

  async function signOut() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ session: user ? { user } : null, user, profile: toProfile(user), loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
