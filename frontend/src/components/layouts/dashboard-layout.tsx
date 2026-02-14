import { Suspense, useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { BaseLayout } from "@/components/layouts/base-layout"
import { PageLoader } from "@/components/ui/page-loader"

export function DashboardLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isHydrated) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in-3" state={{ from: location }} replace />
  }

  return (
    <BaseLayout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </BaseLayout>
  )
}
