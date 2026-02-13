// ==== Supplier Interfaces ====

declare interface CreateSupplierRequest {
  fullName: string
  phoneNumber: string
  address?: string
  company?: string
  notes?: string
}

declare interface UpdateSupplierRequest {
  fullName?: string
  phoneNumber?: string
  address?: string
  company?: string
  notes?: string
}

declare interface Supplier {
  id: number
  fullName: string
  phoneNumber: string
  address?: string
  company?: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  purchases?: Purchase[]
}

declare interface SupplierListResponse {
  data: Supplier[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
