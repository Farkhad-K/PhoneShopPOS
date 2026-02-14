import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/router/protected-route'
import { RoleGuard } from '@/components/router/protected-route'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

// Auth pages
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
  index?: boolean
}

export const routes: RouteConfig[] = [
  // Authentication
  {
    path: "/auth/sign-in-3",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignIn3 />
      </ProtectedRoute>
    )
  },

  // Dashboard layout route (all authenticated pages)
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      // Index redirects to dashboard
      {
        path: "",
        index: true,
        element: <Navigate to="/pos-dashboard" replace />
      },

      // POS Dashboard
      {
        path: "pos-dashboard",
        element: <PhoneShopDashboard />
      },

      // Phone Inventory
      {
        path: "phones",
        element: <PhonesList />
      },
      {
        path: "phones/:id",
        element: <PhoneDetail />
      },

      // Purchases
      {
        path: "purchases",
        element: <PurchasesList />
      },
      {
        path: "purchases/new",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <NewPurchase />
          </RoleGuard>
        )
      },

      // Repairs
      {
        path: "repairs",
        element: <RepairsList />
      },
      {
        path: "repairs/new",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'TECHNICIAN']}>
            <NewRepair />
          </RoleGuard>
        )
      },

      // Sales
      {
        path: "sales",
        element: <SalesList />
      },
      {
        path: "sales/new",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER', 'CASHIER']}>
            <NewSale />
          </RoleGuard>
        )
      },

      // Customers
      {
        path: "customers",
        element: <CustomersList />
      },
      {
        path: "customers/:id",
        element: <CustomerDetail />
      },
      {
        path: "customers/new",
        element: <NewCustomer />
      },

      // Workers (OWNER, MANAGER only)
      {
        path: "workers",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <WorkersList />
          </RoleGuard>
        )
      },
      {
        path: "workers/:id",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <WorkerDetail />
          </RoleGuard>
        )
      },
      {
        path: "workers/new",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <NewWorker />
          </RoleGuard>
        )
      },

      // Reports (OWNER, MANAGER only)
      {
        path: "reports/financial",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <FinancialReport />
          </RoleGuard>
        )
      },
      {
        path: "reports/inventory",
        element: (
          <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
            <InventoryReport />
          </RoleGuard>
        )
      },
    ]
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
