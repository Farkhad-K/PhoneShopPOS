import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/router/protected-route'

// Lazy load components for code splitting and better performance
// Loading animation will show naturally when chunks are being loaded

// Auth pages - Only sign-in-3 is used
const SignIn3 = lazy(() => import('@/app/auth/sign-in-3/page'))

// Phone Shop POS pages
const PhoneShopDashboard = lazy(() => import('@/app/phone-shop-dashboard/page'))
const PhonesList = lazy(() => import('@/app/phones/list/page'))
const PhoneDetail = lazy(() => import('@/app/phones/detail/page'))
const PurchasesList = lazy(() => import('@/app/purchases/list/page'))
const NewPurchase = lazy(() => import('@/app/purchases/new/page'))
const RepairsList = lazy(() => import('@/app/repairs/list/page'))
const NewRepair = lazy(() => import('@/app/repairs/new/page'))
const SalesList = lazy(() => import('@/app/sales/list/page'))
const NewSale = lazy(() => import('@/app/sales/new/page'))
const CustomersList = lazy(() => import('@/app/customers/list/page'))
const CustomerDetail = lazy(() => import('@/app/customers/detail/page'))
const NewCustomer = lazy(() => import('@/app/customers/new/page'))
const WorkersList = lazy(() => import('@/app/workers/list/page'))
const WorkerDetail = lazy(() => import('@/app/workers/detail/page'))
const NewWorker = lazy(() => import('@/app/workers/new/page'))
const FinancialReport = lazy(() => import('@/app/reports/financial/page'))
const InventoryReport = lazy(() => import('@/app/reports/inventory/page'))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
  requireAuth?: boolean
  allowedRoles?: UserRole[]
}

export const routes: RouteConfig[] = [
  // Root redirects to login
  {
    path: "/",
    element: <Navigate to="/auth/sign-in-3" replace />
  },

  // Authentication - Primary login page
  {
    path: "/auth/sign-in-3",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignIn3 />
      </ProtectedRoute>
    )
  },

  // Phone Shop POS Dashboard
  {
    path: "/pos-dashboard",
    element: (
      <ProtectedRoute>
        <PhoneShopDashboard />
      </ProtectedRoute>
    )
  },

  // Phone Inventory Routes
  {
    path: "/phones",
    element: (
      <ProtectedRoute>
        <PhonesList />
      </ProtectedRoute>
    )
  },
  {
    path: "/phones/:id",
    element: (
      <ProtectedRoute>
        <PhoneDetail />
      </ProtectedRoute>
    )
  },

  // Purchase Routes
  {
    path: "/purchases",
    element: (
      <ProtectedRoute>
        <PurchasesList />
      </ProtectedRoute>
    )
  },
  {
    path: "/purchases/new",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
        <NewPurchase />
      </ProtectedRoute>
    )
  },

  // Repair Routes
  {
    path: "/repairs",
    element: (
      <ProtectedRoute>
        <RepairsList />
      </ProtectedRoute>
    )
  },
  {
    path: "/repairs/new",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TECHNICIAN']}>
        <NewRepair />
      </ProtectedRoute>
    )
  },

  // Sale Routes
  {
    path: "/sales",
    element: (
      <ProtectedRoute>
        <SalesList />
      </ProtectedRoute>
    )
  },
  {
    path: "/sales/new",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CASHIER']}>
        <NewSale />
      </ProtectedRoute>
    )
  },

  // Customer Routes
  {
    path: "/customers",
    element: (
      <ProtectedRoute>
        <CustomersList />
      </ProtectedRoute>
    )
  },
  {
    path: "/customers/:id",
    element: (
      <ProtectedRoute>
        <CustomerDetail />
      </ProtectedRoute>
    )
  },
  {
    path: "/customers/new",
    element: (
      <ProtectedRoute>
        <NewCustomer />
      </ProtectedRoute>
    )
  },

  // Worker Routes (OWNER, MANAGER only)
  {
    path: "/workers",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
        <WorkersList />
      </ProtectedRoute>
    )
  },
  {
    path: "/workers/:id",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
        <WorkerDetail />
      </ProtectedRoute>
    )
  },
  {
    path: "/workers/new",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
        <NewWorker />
      </ProtectedRoute>
    )
  },

  // Reports Routes (OWNER, MANAGER only)
  {
    path: "/reports/financial",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
        <FinancialReport />
      </ProtectedRoute>
    )
  },
  {
    path: "/reports/inventory",
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
        <InventoryReport />
      </ProtectedRoute>
    )
  },

  // Catch-all route for 404
  {
    path: "*",
    element: (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground mt-2">Page not found</p>
        </div>
      </div>
    )
  }
]
