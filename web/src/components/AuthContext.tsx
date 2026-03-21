import { createContext, useContext, useState, useSyncExternalStore, useCallback } from "react"

type AuthContextValue = {
  username: string | null
  setUsername: (name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  username: null,
  setUsername: () => {},
  logout: () => {},
})

const STORAGE_KEY = "scrapyard_username"

// Simple external store for localStorage
let listeners: Array<() => void> = []
function subscribe(cb: () => void) {
  listeners = [...listeners, cb]
  return () => { listeners = listeners.filter((l) => l !== cb) }
}
function getSnapshot(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY)
}
function getServerSnapshot(): string | null {
  return null
}
function notify() {
  listeners.forEach((l) => l())
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setUsername = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    notify()
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    notify()
  }, [])

  return (
    <AuthContext.Provider value={{ username, setUsername, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
