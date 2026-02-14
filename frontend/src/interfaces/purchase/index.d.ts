// ==== Purchase Interfaces ====

declare interface PurchasePhoneDto {
  brand: string
  model: string
  imei?: string
  color?: string
  condition: PhoneCondition
  purchasePrice: number
  status: PhoneStatus
  notes?: string
}

declare interface CreatePurchaseRequest {
  supplierId: number
  phones: PurchasePhoneDto[]
  purchaseDate?: string
  paymentStatus: PaymentStatus
  paidAmount?: number
  notes?: string
}

declare interface Purchase {
  id: number
  supplierId: number
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentStatus: PaymentStatus
  purchaseDate: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  supplier?: Supplier
  phones?: Phone[]
  createdBy?: User
}

declare interface PurchaseFilterParams {
  page?: number
  limit?: number
  supplierId?: number
  paymentStatus?: PaymentStatus
  startDate?: string
  endDate?: string
}

declare interface PurchaseListResponse {
  data: Purchase[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
