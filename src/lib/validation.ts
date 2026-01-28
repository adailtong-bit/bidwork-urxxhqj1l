import { z } from 'zod'

export type CountryCode = 'BR' | 'US'

export const countryConfigs = {
  BR: {
    label: 'Brasil',
    phoneRegex: /^\(\d{2}\) \d{4,5}-\d{4}$/, // (11) 99999-9999
    zipRegex: /^\d{5}-\d{3}$/, // 00000-000
    phonePlaceholder: '(11) 99999-0000',
    zipPlaceholder: '00000-000',
    taxIdRegex:
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  },
  US: {
    label: 'United States',
    phoneRegex: /^\(\d{3}\) \d{3}-\d{4}$/, // (555) 555-5555
    zipRegex: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
    phonePlaceholder: '(555) 555-0123',
    zipPlaceholder: '12345',
    taxIdRegex: /^\d{2}-\d{7}$/, // EIN format (approx)
  },
}

export const getCountryValidation = (country: CountryCode) => {
  const config = countryConfigs[country] || countryConfigs.BR

  return {
    phone: z
      .string()
      .regex(
        config.phoneRegex,
        'Formato de telefone inválido para o país selecionado',
      ),
    zip: z
      .string()
      .regex(
        config.zipRegex,
        'Formato de CEP/Zip inválido para o país selecionado',
      ),
    taxId: z
      .string()
      .regex(config.taxIdRegex, 'Documento inválido para o país selecionado')
      .optional()
      .or(z.literal('')),
  }
}

export const commonValidation = {
  email: z.string().email('Formato de email inválido'),
}
