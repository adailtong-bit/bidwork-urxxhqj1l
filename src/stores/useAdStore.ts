import { create } from 'zustand'
import { differenceInDays, differenceInHours } from 'date-fns'
import { usePricingMatrixStore } from './usePricingMatrixStore'

export interface AdvertiserDetails {
  legalAddress: string
  taxId: string
  billingContact: {
    name: string
    email: string
    phone: string
  }
  adContact: {
    name: string
    email: string
    phone: string
  }
}

export interface Ad {
  id: string
  title: string
  imageUrl: string
  type: 'regional' | 'segmented'
  segment: 'dashboard' | 'search' | 'profile' | 'home' | 'all'
  link: string
  active: boolean

  advertiserName: string
  advertiserDetails?: AdvertiserDetails
  planLevel: string
  category: string
  region: string
  country: 'BR' | 'US' | 'Other'
  startDate: Date
  endDate: Date
  status: 'active' | 'suspended' | 'canceled' | 'expired'
  isConstruction: boolean
  calculatedPrice: number
  createdAt: Date
  skillWeight: number

  views: number
  clicks: number
  likes: number
  dislikes: number
}

interface AdState {
  ads: Ad[]
  addAd: (ad: Partial<Ad>) => void
  removeAd: (id: string) => void
  toggleAdStatus: (id: string) => void
  updateAdStatus: (id: string, status: Ad['status']) => void
  extendAd: (id: string, newEndDate: Date) => void
  getAdsBySegment: (segment: string, isPaidUser?: boolean) => Ad[]
  checkExpirations: () => Ad[]
}

const now = new Date()
const nextMonth = new Date(now)
nextMonth.setMonth(now.getMonth() + 1)
const yesterday = new Date(now)
yesterday.setDate(now.getDate() - 1)

const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Materiais de Construção SP',
    imageUrl: 'https://img.usecurling.com/p/600/200?q=construction',
    type: 'regional',
    segment: 'dashboard',
    link: '#',
    active: true,
    advertiserName: 'Construtora Alpha',
    advertiserDetails: {
      legalAddress: 'Av. Paulista, 1000 - SP',
      taxId: '12.345.678/0001-90',
      billingContact: {
        name: 'João Silva',
        email: 'financeiro@alpha.com.br',
        phone: '(11) 99999-9999',
      },
      adContact: {
        name: 'Maria Souza',
        email: 'marketing@alpha.com.br',
        phone: '(11) 98888-8888',
      },
    },
    planLevel: 'Premium',
    category: 'Construction',
    region: 'BR',
    country: 'BR',
    startDate: new Date(now.getFullYear(), 0, 1),
    endDate: nextMonth,
    status: 'active',
    isConstruction: true,
    calculatedPrice: 1500,
    createdAt: new Date(now.getFullYear(), 0, 1),
    skillWeight: 10,
    views: 1240,
    clicks: 85,
    likes: 12,
    dislikes: 2,
  },
  {
    id: '2',
    title: 'Curso de React Avançado',
    imageUrl: 'https://img.usecurling.com/p/600/200?q=coding',
    type: 'segmented',
    segment: 'dashboard',
    link: '#',
    active: true,
    advertiserName: 'Tech School',
    advertiserDetails: {
      legalAddress: '123 Tech Lane, Silicon Valley',
      taxId: '12-3456789',
      billingContact: {
        name: 'John Doe',
        email: 'billing@techschool.com',
        phone: '+1 555 123 4567',
      },
      adContact: {
        name: 'Jane Doe',
        email: 'ads@techschool.com',
        phone: '+1 555 987 6543',
      },
    },
    planLevel: 'Gold',
    category: 'Technology',
    region: 'US',
    country: 'US',
    startDate: new Date(now.getFullYear(), 0, 1),
    endDate: yesterday,
    status: 'active',
    isConstruction: false,
    calculatedPrice: 800,
    createdAt: new Date(),
    skillWeight: 7,
    views: 980,
    clicks: 120,
    likes: 45,
    dislikes: 1,
  },
]

export const useAdStore = create<AdState>((set, get) => ({
  ads: mockAds,
  addAd: (ad) =>
    set((state) => ({
      ads: [
        ...state.ads,
        {
          ...(ad as Ad),
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    })),
  removeAd: (id) =>
    set((state) => ({
      ads: state.ads.filter((ad) => ad.id !== id),
    })),
  toggleAdStatus: (id) =>
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id ? { ...ad, active: !ad.active } : ad,
      ),
    })),
  updateAdStatus: (id, status) =>
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id ? { ...ad, status, active: status === 'active' } : ad,
      ),
    })),
  extendAd: (id, newEndDate) =>
    set((state) => {
      const matrix = usePricingMatrixStore.getState()
      return {
        ads: state.ads.map((ad) => {
          if (ad.id === id) {
            const days = differenceInDays(newEndDate, new Date(ad.endDate))
            let extra = 0
            if (days > 0) {
              extra = matrix.calculatePrice(
                ad.planLevel,
                ad.region,
                ad.category,
                days,
              )
            }
            return {
              ...ad,
              endDate: newEndDate,
              status: 'active',
              active: true,
              calculatedPrice: (ad.calculatedPrice || 0) + extra,
            }
          }
          return ad
        }),
      }
    }),
  getAdsBySegment: (segment, isPaidUser = false) => {
    const { ads } = get()
    const now = new Date()

    const validAds = ads.filter(
      (ad) =>
        ad.active &&
        ad.status === 'active' &&
        new Date(ad.endDate) >= now &&
        (ad.segment === segment || ad.segment === 'all'),
    )

    // Time-Gate logic: 24h block for free users
    const timeGatedAds = validAds.filter((ad) => {
      if (!ad.createdAt) return true
      const hours = differenceInHours(now, new Date(ad.createdAt))
      if (hours < 24 && !isPaidUser) {
        return false
      }
      return true
    })

    // Skill Matrix Priority: Sort by skill weight
    const sorted = [...timeGatedAds].sort((a, b) => {
      const wA = a.skillWeight || 1
      const wB = b.skillWeight || 1
      if (wA !== wB) return wB - wA
      return 0.5 - Math.random() // randomized tie-break
    })

    return sorted.slice(0, 2)
  },
  checkExpirations: () => {
    const { ads } = get()
    const now = new Date()
    const expiredAds: Ad[] = []

    const newAds = ads.map((ad) => {
      if (ad.status === 'active' && new Date(ad.endDate) < now) {
        const expiredAd = { ...ad, status: 'expired' as const, active: false }
        expiredAds.push(expiredAd)
        return expiredAd
      }
      return ad
    })

    if (expiredAds.length > 0) {
      set({ ads: newAds })
    }

    return expiredAds
  },
}))
