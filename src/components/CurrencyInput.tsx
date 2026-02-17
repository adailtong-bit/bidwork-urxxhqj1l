import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value'
> {
  value: number
  onChange: (value: number) => void
}

export function CurrencyInput({
  value,
  onChange,
  className,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')
  const { currentLanguage } = useLanguageStore()

  React.useEffect(() => {
    // Determine locale and currency based on selected language
    let locale = 'pt-BR'
    let currency = 'BRL'

    if (currentLanguage === 'en') {
      locale = 'en-US'
      currency = 'USD'
    } else if (currentLanguage === 'es') {
      locale = 'es-ES' // Using Spain as proxy for formatting but keeping USD usually for LATAM general or specific currency
      currency = 'USD' // Defaulting to USD for international template
    }

    // Format the value as currency
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value)

    setDisplayValue(formatted)
  }, [value, currentLanguage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Remove everything that is not a digit
    const numericValue = inputValue.replace(/[^0-9]/g, '')

    // Convert to number (dividing by 100 to handle cents)
    const floatValue = Number(numericValue) / 100

    onChange(floatValue)
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={cn('font-mono', className)}
    />
  )
}
