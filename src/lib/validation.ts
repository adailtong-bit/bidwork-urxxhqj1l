import { z } from 'zod'

export type CountryCode = 'BR' | 'US'

export const commonValidation = {
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}

export function getCountryValidation(country: CountryCode | string) {
  if (country === 'US') {
    return {
      phone: z.string().min(14, 'Invalid phone number').max(14),
      zip: z.string().min(5, 'Invalid ZIP code').max(10),
      taxId: z.string().min(9, 'Invalid Tax ID').max(11),
    }
  }

  // Default to BR
  return {
    phone: z.string().min(14, 'Telefone inválido').max(15),
    zip: z.string().min(9, 'CEP inválido').max(9),
    taxId: z.string().min(14, 'Documento inválido').max(18),
  }
}

export const formatPhone = (val: string, country: string) => {
  const digits = val.replace(/\D/g, '')
  if (country === 'US') {
    if (digits.length === 0) return ''
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }
  // BR
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export const formatZip = (val: string, country: string) => {
  const digits = val.replace(/\D/g, '')
  if (country === 'US') {
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`
  }
  // BR
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
}
