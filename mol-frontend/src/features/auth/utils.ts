import type { UserProfile } from '@/shared/types'

const TOKEN_KEY = 'mol.jwt'
const USER_KEY = 'mol.user'

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function getStoredUser(): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: UserProfile): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthStorage(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}
