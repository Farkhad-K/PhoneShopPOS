// ==== Sale Interfaces ====

declare interface CreateSaleRequest {
  phoneId: number
  customerId?: number
  salePrice: number
  paymentType?: PaymentType
  paymentStatus?: PaymentStatus
  paidAmount?: number
  saleDate?: string
  notes?: string
}

declare interface UpdateSaleRequest {
  salePrice?: number
  paymentStatus?: PaymentStatus
  paidAmount?: number
  notes?: string
}

declare interface Sale {
  id: number
  phoneId: number
  customerId?: number
  salePrice: number
  paidAmount: number
  remainingAmount: number
  paymentType: PaymentType
  paymentStatus: PaymentStatus
  saleDate: string
  profit: number
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  phone?: Phone
  customer?: Customer
  createdBy?: User
}

declare interface SaleFilterParams {
  page?: number
  limit?: number
  customerId?: number
  paymentStatus?: PaymentStatus
  paymentType?: PaymentType
  startDate?: string
  endDate?: string
}

declare interface SaleListResponse {
  data: Sale[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
