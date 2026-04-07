import { z } from 'zod'

export const commonValidation = {
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
}

export function getCountryValidation(country: 'BR' | 'US' | string) {
  if (country === 'US') {
    return {
      phone: z.string().min(10, 'Invalid phone number').max(14),
      zip: z.string().min(5, 'Invalid ZIP code').max(10),
      taxId: z.string().min(9, 'Invalid Tax ID').max(11),
    }
  }

  // Default to BR
  return {
    phone: z.string().min(14, 'Telefone inválido').max(15),
    zip: z.string().min(8, 'CEP inválido').max(9),
    taxId: z.string().min(14, 'Documento inválido').max(18),
  }
}
