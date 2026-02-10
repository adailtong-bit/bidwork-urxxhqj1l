import { z } from 'zod'

export type CountryCode = 'BR' | 'US'

export const countryConfigs = {
  BR: {
    label: 'Brasil',
    // Matches (11) 9999-9999 or (11) 99999-9999
    phoneRegex: /^\(\d{2}\) \d{4,5}-\d{4}$/,
    // Matches 00000-000
    zipRegex: /^\d{5}-\d{3}$/,
    phonePlaceholder: '(11) 99999-0000',
    zipPlaceholder: '00000-000',
    // Matches CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)
    taxIdRegex:
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  },
  US: {
    label: 'United States',
    // Matches (555) 555-5555
    phoneRegex: /^\(\d{3}\) \d{3}-\d{4}$/,
    // Matches 12345 or 12345-6789
    zipRegex: /^\d{5}(-\d{4})?$/,
    phonePlaceholder: '(555) 555-0123',
    zipPlaceholder: '12345',
    // Simple EIN check
    taxIdRegex: /^\d{2}-\d{7}$/,
  },
}

export const getCountryValidation = (country: CountryCode) => {
  const config = countryConfigs[country] || countryConfigs.BR

  return {
    phone: z
      .string()
      .regex(
        config.phoneRegex,
        country === 'BR'
          ? 'Formato inválido: (99) 99999-9999'
          : 'Invalid format: (555) 555-5555',
      ),
    zip: z
      .string()
      .regex(
        config.zipRegex,
        country === 'BR' ? 'CEP inválido: 00000-000' : 'Invalid Zip: 12345',
      ),
    taxId: z
      .string()
      .regex(
        config.taxIdRegex,
        country === 'BR' ? 'CPF/CNPJ inválido' : 'Invalid Tax ID',
      )
      .optional()
      .or(z.literal('')),
  }
}

export const commonValidation = {
  email: z.string().email('Email inválido / Invalid email'),
}
