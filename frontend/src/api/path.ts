export const AUTH = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
} as const

export const USERS = {
  GET: '/api/users',
  GET_BY_ID: (id: number) => `/api/users/${id}`,
  POST: '/api/users',
  PATCH: (id: number) => `/api/users/${id}`,
  DELETE: (id: number) => `/api/users/${id}`,
} as const

export const PHONES = {
  BASE: '/api/phones',
  BY_ID: (id: number) => `/api/phones/${id}`,
} as const

export const PURCHASES = {
  BASE: '/api/purchases',
  BY_ID: (id: number) => `/api/purchases/${id}`,
} as const

export const REPAIRS = {
  BASE: '/api/repairs',
  BY_ID: (id: number) => `/api/repairs/${id}`,
  COMPLETE: (id: number) => `/api/repairs/${id}/complete`,
} as const

export const SALES = {
  BASE: '/api/sales',
  BY_ID: (id: number) => `/api/sales/${id}`,
} as const

export const CUSTOMERS = {
  BASE: '/api/customers',
  BY_ID: (id: number) => `/api/customers/${id}`,
  BALANCE: (id: number) => `/api/customers/${id}/balance`,
} as const

export const SUPPLIERS = {
  BASE: '/api/suppliers',
  BY_ID: (id: number) => `/api/suppliers/${id}`,
} as const

export const WORKERS = {
  BASE: '/api/workers',
  BY_ID: (id: number) => `/api/workers/${id}`,
  PAYMENTS: '/api/worker-payments',
  PAYMENT_BY_ID: (id: number) => `/api/worker-payments/${id}`,
} as const

export const PAYMENTS = {
  BASE: '/api/payments',
  BY_ID: (id: number) => `/api/payments/${id}`,
  APPLY: '/api/payments/apply',
} as const

export const REPORTS = {
  SALES: '/api/reports/sales',
  PURCHASES: '/api/reports/purchases',
  REPAIRS: '/api/reports/repairs',
  FINANCIAL_SUMMARY: '/api/reports/financial-summary',
  DASHBOARD: '/api/reports/dashboard',
} as const
