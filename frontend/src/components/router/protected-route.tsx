import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { PageLoader } from '@/components/ui/page-loader'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Give a moment for state to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (isChecking) {
    return <PageLoader />
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  }

  // If route has role restrictions
  if (requireAuth && allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/errors/forbidden" replace />
    }
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
