// ==== Customer Interfaces ====

declare interface CreateCustomerRequest {
  fullName: string
  phoneNumber: string
  address?: string
  passportId?: string
  notes?: string
}

declare interface UpdateCustomerRequest {
  fullName?: string
  phoneNumber?: string
  address?: string
  passportId?: string
  notes?: string
}

declare interface Customer {
  id: number
  fullName: string
  phoneNumber: string
  address?: string
  passportId?: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  sales?: Sale[]
  purchases?: Purchase[]
}

declare interface CustomerBalance {
  customerId: number
  customerName: string
  totalDebt: number
  unpaidSales: {
    id: number
    salePrice: number
    paidAmount: number
    remainingBalance: number
    saleDate: string
    phone: {
      brand: string
      model: string
    }
  }[]
}

declare interface CustomerListResponse {
  data: Customer[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
