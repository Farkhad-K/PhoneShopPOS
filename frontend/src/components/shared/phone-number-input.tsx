import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forwardRef, useCallback } from 'react'

interface PhoneNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  onChange?: (value: string) => void
  error?: string
}

export const PhoneNumberInput = forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(({ label, onChange, error, className, ...props }, ref) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, '')

      if (value.length > 0 && !value.startsWith('998')) {
        value = '998' + value
      }

      if (value.length > 12) {
        value = value.slice(0, 12)
      }

      onChange?.(value)
    },
    [onChange]
  )

  const formatPhoneNumber = (value: string | number | readonly string[] | undefined) => {
    if (!value) return '+998'

    const stringValue = value.toString().replace(/\D/g, '')

    if (!stringValue) return '+998'

    if (stringValue.startsWith('998')) {
      const number = stringValue.slice(3)
      if (number.length === 0) return '+998'
      if (number.length <= 2) return `+998 ${number}`
      if (number.length <= 5) return `+998 ${number.slice(0, 2)} ${number.slice(2)}`
      if (number.length <= 7) return `+998 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
      return `+998 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7, 9)}`
    }

    return `+998 ${stringValue}`
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        {...props}
        onChange={handleChange}
        value={props.value ? formatPhoneNumber(props.value) : '+998'}
        placeholder="+998 XX XXX XX XX"
        className={className}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})

PhoneNumberInput.displayName = 'PhoneNumberInput'
