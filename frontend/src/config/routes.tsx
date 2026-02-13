import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/router/protected-route'

// Lazy load components for code splitting and better performance
// Loading animation will show naturally when chunks are being loaded
const Landing = lazy(() => import('@/app/landing/page'))
const Dashboard = lazy(() => import('@/app/dashboard/page'))
const Dashboard2 = lazy(() => import('@/app/dashboard-2/page'))
const Mail = lazy(() => import('@/app/mail/page'))
const Tasks = lazy(() => import('@/app/tasks/page'))
const Chat = lazy(() => import('@/app/chat/page'))
const Calendar = lazy(() => import('@/app/calendar/page'))
const Users = lazy(() => import('@/app/users/page'))
const FAQs = lazy(() => import('@/app/faqs/page'))
const Pricing = lazy(() => import('@/app/pricing/page'))

// Auth pages
const SignIn = lazy(() => import('@/app/auth/sign-in/page'))
const SignIn2 = lazy(() => import('@/app/auth/sign-in-2/page'))
const SignIn3 = lazy(() => import('@/app/auth/sign-in-3/page'))
const SignUp = lazy(() => import('@/app/auth/sign-up/page'))
const SignUp2 = lazy(() => import('@/app/auth/sign-up-2/page'))
const SignUp3 = lazy(() => import('@/app/auth/sign-up-3/page'))
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'))
const ForgotPassword2 = lazy(() => import('@/app/auth/forgot-password-2/page'))
const ForgotPassword3 = lazy(() => import('@/app/auth/forgot-password-3/page'))

// Error pages
const Unauthorized = lazy(() => import('@/app/errors/unauthorized/page'))
const Forbidden = lazy(() => import('@/app/errors/forbidden/page'))
const NotFound = lazy(() => import('@/app/errors/not-found/page'))
const InternalServerError = lazy(() => import('@/app/errors/internal-server-error/page'))
const UnderMaintenance = lazy(() => import('@/app/errors/under-maintenance/page'))

// Settings pages
const UserSettings = lazy(() => import('@/app/settings/user/page'))
const AccountSettings = lazy(() => import('@/app/settings/account/page'))
const BillingSettings = lazy(() => import('@/app/settings/billing/page'))
const AppearanceSettings = lazy(() => import('@/app/settings/appearance/page'))
const NotificationSettings = lazy(() => import('@/app/settings/notifications/page'))
const ConnectionSettings = lazy(() => import('@/app/settings/connections/page'))

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
  // Default route - redirect to Phone Shop Dashboard
  {
    path: "/",
    element: <Navigate to="pos-dashboard" replace />
  },

  // Landing Page (public)
  {
    path: "/landing",
    element: <Landing />
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

  // Dashboard Routes (protected)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/dashboard-2",
    element: (
      <ProtectedRoute>
        <Dashboard2 />
      </ProtectedRoute>
    )
  },

  // Application Routes (protected)
  {
    path: "/mail",
    element: (
      <ProtectedRoute>
        <Mail />
      </ProtectedRoute>
    )
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute>
        <Tasks />
      </ProtectedRoute>
    )
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    )
  },
  {
    path: "/calendar",
    element: (
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    )
  },

  // Content Pages (protected, ADMIN only for users management)
  {
    path: "/users",
    element: (
      <ProtectedRoute allowedRoles={['OWNER']}>
        <Users />
      </ProtectedRoute>
    )
  },
  {
    path: "/faqs",
    element: (
      <ProtectedRoute>
        <FAQs />
      </ProtectedRoute>
    )
  },
  {
    path: "/pricing",
    element: (
      <ProtectedRoute>
        <Pricing />
      </ProtectedRoute>
    )
  },

  // Authentication Routes (public - redirect to dashboard if logged in)
  {
    path: "/auth/sign-in",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignIn />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/sign-in-2",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignIn2 />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/sign-in-3",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignIn3 />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/sign-up",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignUp />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/sign-up-2",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignUp2 />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/sign-up-3",
    element: (
      <ProtectedRoute requireAuth={false}>
        <SignUp3 />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/forgot-password",
    element: (
      <ProtectedRoute requireAuth={false}>
        <ForgotPassword />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/forgot-password-2",
    element: (
      <ProtectedRoute requireAuth={false}>
        <ForgotPassword2 />
      </ProtectedRoute>
    )
  },
  {
    path: "/auth/forgot-password-3",
    element: (
      <ProtectedRoute requireAuth={false}>
        <ForgotPassword3 />
      </ProtectedRoute>
    )
  },

  // Error Pages (public)
  {
    path: "/errors/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/errors/forbidden",
    element: <Forbidden />
  },
  {
    path: "/errors/not-found",
    element: <NotFound />
  },
  {
    path: "/errors/internal-server-error",
    element: <InternalServerError />
  },
  {
    path: "/errors/under-maintenance",
    element: <UnderMaintenance />
  },

  // Settings Routes (protected)
  {
    path: "/settings/user",
    element: (
      <ProtectedRoute>
        <UserSettings />
      </ProtectedRoute>
    )
  },
  {
    path: "/settings/account",
    element: (
      <ProtectedRoute>
        <AccountSettings />
      </ProtectedRoute>
    )
  },
  {
    path: "/settings/billing",
    element: (
      <ProtectedRoute allowedRoles={['OWNER']}>
        <BillingSettings />
      </ProtectedRoute>
    )
  },
  {
    path: "/settings/appearance",
    element: (
      <ProtectedRoute>
        <AppearanceSettings />
      </ProtectedRoute>
    )
  },
  {
    path: "/settings/notifications",
    element: (
      <ProtectedRoute>
        <NotificationSettings />
      </ProtectedRoute>
    )
  },
  {
    path: "/settings/connections",
    element: (
      <ProtectedRoute>
        <ConnectionSettings />
      </ProtectedRoute>
    )
  },

  // Catch-all route for 404
  {
    path: "*",
    element: <NotFound />
  }
]
