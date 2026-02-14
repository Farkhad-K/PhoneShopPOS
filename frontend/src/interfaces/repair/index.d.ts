// ==== Repair Interfaces ====

declare interface CreateRepairRequest {
  phoneId: number
  description: string
  repairCost: number
  status?: RepairStatus
  startDate?: string
  notes?: string
}

declare interface UpdateRepairRequest {
  description?: string
  repairCost?: number
  status?: RepairStatus
  completedDate?: string
  notes?: string
}

declare interface Repair {
  id: number
  phoneId: number
  description: string
  repairCost: number
  status: RepairStatus
  startDate?: string
  completedDate?: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  phone?: Phone
  createdBy?: User
}

declare interface RepairFilterParams {
  page?: number
  limit?: number
  phoneId?: number
  status?: RepairStatus
  startDate?: string
  endDate?: string
}

declare interface RepairListResponse {
  data: Repair[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
