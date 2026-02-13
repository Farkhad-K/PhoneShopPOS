export enum Role {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  TECHNICIAN = 'TECHNICIAN',
}

export enum MeasurementType {
  KG = 'KG',
  PIECE = 'UNIT',
}

export enum ProductIngredientSource {
  SEMI_PRODUCT = 'SEMI_PRODUCT',
  RAW_MATERIAL = 'RAW_MATERIAL',
}

export enum ProductSemiProductSource {
  ASSEMBLER = 'ASSEMBLER',
  STORE = 'STORE',
  BOTH = 'BOTH',
}

// Phone Shop POS Enums
export enum PhoneStatus {
  IN_STOCK = 'IN_STOCK',           // Ready to sell (no repair needed)
  IN_REPAIR = 'IN_REPAIR',         // Currently being repaired
  READY_FOR_SALE = 'READY_FOR_SALE', // Repaired, ready to sell
  SOLD = 'SOLD',                   // Sold to customer
  RETURNED = 'RETURNED'            // Returned by customer
}

export enum PhoneCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  UNPAID = 'UNPAID',
}

export enum RepairStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentType {
  CASH = 'CASH',           // Full payment upfront
  PAY_LATER = 'PAY_LATER', // Customer debt (partial or full)
}
