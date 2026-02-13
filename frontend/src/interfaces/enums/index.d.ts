// ==== Type Aliases matching backend enums ====

declare type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'TECHNICIAN'

declare type PhoneStatus =
  | 'IN_STOCK'
  | 'IN_REPAIR'
  | 'READY_FOR_SALE'
  | 'SOLD'
  | 'RETURNED'

declare type PhoneCondition =
  | 'NEW'
  | 'LIKE_NEW'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'

declare type PaymentStatus =
  | 'PAID'
  | 'PARTIAL'
  | 'UNPAID'

declare type RepairStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

declare type PaymentType =
  | 'CASH'
  | 'PAY_LATER'

declare type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CARD'
  | 'MOBILE_PAYMENT'
