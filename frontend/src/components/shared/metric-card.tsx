import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  iconClassName?: string
  trend?: 'up' | 'down'
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'from last month',
  icon: Icon,
  iconClassName,
  trend,
}: MetricCardProps) {
  const isPositive = trend === 'up' || (change !== undefined && change > 0)
  const isNegative = trend === 'down' || (change !== undefined && change < 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="flex items-center text-xs text-muted-foreground mt-1">
            {isPositive && (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            )}
            {isNegative && (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                'font-medium',
                isPositive && 'text-green-500',
                isNegative && 'text-red-500'
              )}
            >
              {change > 0 && '+'}
              {change}%
            </span>
            <span className="ml-1">{changeLabel}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
