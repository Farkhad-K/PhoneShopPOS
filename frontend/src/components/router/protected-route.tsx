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
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (isChecking) {
    return <PageLoader />
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/sign-in-3" state={{ from: location }} replace />
  }

  if (requireAuth && allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">403</h1>
            <p className="text-muted-foreground mt-2">Access forbidden</p>
          </div>
        </div>
      )
    }
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/pos-dashboard" replace />
  }

  return <>{children}</>
}

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAppSelector((state) => state.auth)

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-1 min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">403</h1>
          <p className="text-muted-foreground mt-2">Access forbidden</p>
          <p className="text-muted-foreground text-sm mt-1">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
