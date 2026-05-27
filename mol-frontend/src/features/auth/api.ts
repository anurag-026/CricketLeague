import { http } from '@/shared/api/axios'
import type {
  AuthTokenResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@/shared/types'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/api/v1/auth/login', payload)
  return data
}

export async function register(
  payload: RegisterRequest,
): Promise<AuthTokenResponse> {
  const { data } = await http.post<AuthTokenResponse>(
    '/api/v1/auth/register',
    payload,
  )
  return data
}
