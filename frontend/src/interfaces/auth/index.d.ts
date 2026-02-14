// ==== Auth Request Payloads ====
declare interface LoginRequest {
  username: string
  password: string
}

declare interface RefreshTokenRequest {
  refresh_token: string
}

// ==== Auth Response Types ====
declare interface User {
  id: number
  username: string
  role: UserRole
  fullName?: string
  email?: string
  createdAt: string
  updatedAt: string
}

declare interface AuthTokens {
  access_token: string
  refresh_token: string
}

declare interface AuthResponse {
  user: User
  auth: AuthTokens
}

declare interface LogoutResponse {
  message: string
}

declare interface CreateUserRequest {
  username: string
  password: string
  role: UserRole
  fullName?: string
  email?: string
}

declare interface UpdateUserRequest {
  fullName?: string
  email?: string
  password?: string
}
