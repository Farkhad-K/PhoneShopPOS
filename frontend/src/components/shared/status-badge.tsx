import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: PhoneStatus | PaymentStatus | RepairStatus
  className?: string
}

const phoneStatusConfig: Record<
  PhoneStatus,
  { label: string; className: string }
> = {
  IN_STOCK: {
    label: 'In Stock',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  IN_REPAIR: {
    label: 'In Repair',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  READY_FOR_SALE: {
    label: 'Ready for Sale',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  SOLD: {
    label: 'Sold',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
  RETURNED: {
    label: 'Returned',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
}

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PAID: {
    label: 'Paid',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  PARTIAL: {
    label: 'Partial',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  UNPAID: {
    label: 'Unpaid',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
}

const repairStatusConfig: Record<
  RepairStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config =
    phoneStatusConfig[status as PhoneStatus] ||
    paymentStatusConfig[status as PaymentStatus] ||
    repairStatusConfig[status as RepairStatus]

  if (!config) return null

  return (
    <Badge
      variant="outline"
      className={cn('border-0', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
