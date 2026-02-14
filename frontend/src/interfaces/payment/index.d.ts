// ==== Payment Interfaces ====

declare interface CreatePaymentRequest {
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  notes?: string
  customerId?: number
  supplierId?: number
  saleId?: number
  purchaseId?: number
}

declare interface Payment {
  id: number
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  notes?: string
  customerId?: number
  supplierId?: number
  saleId?: number
  purchaseId?: number
  createdAt: string
  updatedAt: string

  // Relations
  customer?: Customer
  supplier?: Supplier
  sale?: Sale
  purchase?: Purchase
  createdBy?: User
}

declare interface ApplyPaymentRequest {
  customerId?: number
  supplierId?: number
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: string
  notes?: string
}

declare interface PaymentListResponse {
  data: Payment[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
