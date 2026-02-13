import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forwardRef, useCallback } from 'react'

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  currency?: string
  onChange?: (value: number) => void
  error?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, currency = 'UZS', onChange, error, className, ...props }, ref) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^\d.]/g, '')
        const numericValue = parseFloat(rawValue) || 0
        onChange?.(numericValue)
      },
      [onChange]
    )

    const formatValue = (value: string | number | readonly string[] | undefined) => {
      if (!value) return ''
      const stringValue = value.toString().replace(/[^\d.]/g, '')
      const parts = stringValue.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return parts.join('.')
    }

    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            type="text"
            inputMode="decimal"
            {...props}
            onChange={handleChange}
            value={props.value ? formatValue(props.value) : ''}
            className={className}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {currency}
          </span>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
