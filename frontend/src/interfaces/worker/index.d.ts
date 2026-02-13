// ==== Worker Interfaces ====

declare interface CreateWorkerRequest {
  fullName: string
  phoneNumber: string
  email?: string
  address?: string
  passportId: string
  hireDate: string
  monthlySalary: number
  notes?: string
  userId?: number
}

declare interface UpdateWorkerRequest {
  fullName?: string
  phoneNumber?: string
  email?: string
  address?: string
  monthlySalary?: number
  notes?: string
}

declare interface Worker {
  id: number
  fullName: string
  phoneNumber: string
  email?: string
  address?: string
  passportId: string
  hireDate: string
  monthlySalary: number
  notes?: string
  userId?: number
  createdAt: string
  updatedAt: string

  // Relations
  user?: User
  payments?: WorkerPayment[]
}

declare interface CreateWorkerPaymentRequest {
  workerId: number
  month: number
  year: number
  amount: number
  bonus?: number
  deduction?: number
  notes?: string
}

declare interface WorkerPayment {
  id: number
  workerId: number
  month: number
  year: number
  amount: number
  bonus: number
  deduction: number
  totalPaid: number
  paymentDate: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  worker?: Worker
}

declare interface WorkerListResponse {
  data: Worker[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

declare interface WorkerPaymentListResponse {
  data: WorkerPayment[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
