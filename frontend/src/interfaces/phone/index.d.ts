// ==== Phone Interfaces ====

declare interface Phone {
  id: number
  brand: string
  model: string
  imei?: string
  color?: string
  condition: PhoneCondition
  purchasePrice: number
  status: PhoneStatus
  barcode: string
  totalCost: number
  purchaseId: number
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations (optional, loaded when needed)
  purchase?: Purchase
  repairs?: Repair[]
  sale?: Sale
}

declare interface PhoneFilterParams {
  page?: number
  limit?: number
  status?: PhoneStatus
  brand?: string
  model?: string
  search?: string
  startDate?: string
  endDate?: string
}

declare interface PhoneListResponse {
  data: Phone[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
