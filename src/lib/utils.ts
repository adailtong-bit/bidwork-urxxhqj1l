/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskPhone(value: string, lang: string = 'pt') {
  let v = value.replace(/\D/g, '')
  if (lang === 'pt') {
    if (v.length > 11) v = v.substring(0, 11)
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    return v
  }
  // US
  if (v.length > 10) v = v.substring(0, 10)
  if (v.length > 6) return v.replace(/^(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3')
  if (v.length > 3) return v.replace(/^(\d{3})(\d{0,3})/, '($1) $2')
  return v
}

export function maskZip(value: string, lang: string = 'pt') {
  let v = value.replace(/\D/g, '')
  if (lang === 'pt') {
    if (v.length > 8) v = v.substring(0, 8)
    if (v.length > 5) return v.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
    return v
  }
  // US
  if (v.length > 5) v = v.substring(0, 5)
  return v
}
