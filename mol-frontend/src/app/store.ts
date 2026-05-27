import { create } from 'zustand'
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '@/features/auth/utils'
import type { UserProfile } from '@/shared/types'

interface AppState {
  token: string | null
  user: UserProfile | null
  isHydrated: boolean

  setAuth: (token: string, user: UserProfile) => void
  clearAuth: () => void
  hydrateFromStorage: () => void
}

export const useAppStore = create<AppState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  setAuth: (token, user) => {
    setStoredToken(token)
    setStoredUser(user)
    set({ token, user })
  },

  clearAuth: () => {
    clearAuthStorage()
    set({ token: null, user: null })
  },

  hydrateFromStorage: () => {
    set({
      token: getStoredToken(),
      user: getStoredUser(),
      isHydrated: true,
    })
  },
}))

export const selectIsAuthenticated = (s: AppState) => Boolean(s.token)
