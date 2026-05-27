export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
  username: string
}

export interface AuthTokenResponse {
  token: string
  userId: string
}

export interface UserProfile {
  userId: string
  username: string
  email?: string
}
