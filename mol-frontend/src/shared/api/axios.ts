import axios, { type AxiosError } from 'axios'
import { getStoredToken, clearAuthStorage } from '@/features/auth/utils'
import { useAppStore } from '@/app/store'
import type { ApiError } from '@/shared/types'

const rawApiBaseUrl = "https://mol-backend.onrender.com"
const baseURL = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl.slice(0, -1) : rawApiBaseUrl

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

http.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const status = error.response?.status
    if (status === 401) {
      clearAuthStorage()
      useAppStore.getState().clearAuth()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    const apiError: ApiError = {
      error: error.response?.data?.error ?? error.message ?? 'Request failed',
      status,
    }
    return Promise.reject(apiError)
  },
)
