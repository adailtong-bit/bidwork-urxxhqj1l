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
  const { currentLanguage, currentCurrency } = useLanguageStore()

  React.useEffect(() => {
    // Determine locale for number formatting based on current language
    let locale = 'pt-BR'

    if (currentLanguage === 'en') {
      locale = 'en-US'
    } else if (currentLanguage === 'es') {
      locale = 'es-ES'
    }

    // Format the value as currency using the selected currency from store
    const resolvedCurrency =
      currentCurrency ||
      (currentLanguage === 'en'
        ? 'USD'
        : currentLanguage === 'es'
          ? 'EUR'
          : 'BRL')

    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: resolvedCurrency,
    }).format(value)

    setDisplayValue(formatted)
  }, [value, currentLanguage, currentCurrency])

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
