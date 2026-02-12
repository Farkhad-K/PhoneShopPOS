/**
 * Custom hook for authentication using RTK Query
 * Provides easy access to auth state and actions
 */

import { useAppSelector } from '@/store/hooks'
import {
  useLoginMutation,
  useLogoutMutation,
} from '@/api/auth'

export function useAuth() {
  const { user, token, refreshToken, isAuthenticated } = useAppSelector(
    (state) => state.auth
  )

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()

  const login = async (credentials: LoginRequest) => {
    return loginMutation(credentials).unwrap()
  }

  const logout = async () => {
    return logoutMutation().unwrap()
  }

  return {
    // State
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading: isLoggingIn || isLoggingOut,

    // Actions
    login,
    logout,

    // Loading states
    isLoggingIn,
    isLoggingOut,
  }
}
