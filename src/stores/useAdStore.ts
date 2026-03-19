import { create } from 'zustand'

export interface Ad {
  id: string
  title: string
  imageUrl: string
  type: 'regional' | 'segmented'
  segment: 'dashboard' | 'search' | 'profile' | 'home' | 'all'
  link: string
  active: boolean // legacy

  // New fields for billing & lifecycle
  advertiserName: string
  planLevel: string
  country: 'BR' | 'US' | 'Other'
  startDate: Date
  endDate: Date
  status: 'active' | 'suspended' | 'canceled' | 'expired'
  isConstruction: boolean

  // Metrics
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
  getAdsBySegment: (segment: string) => Ad[]
}

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
    planLevel: 'Enterprise',
    country: 'BR',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    isConstruction: true,
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
    planLevel: 'Premium',
    country: 'US',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-08-01'),
    status: 'active',
    isConstruction: false,
    views: 980,
    clicks: 120,
    likes: 45,
    dislikes: 1,
  },
  {
    id: '3',
    title: 'Ferramentas Premium',
    imageUrl: 'https://img.usecurling.com/p/600/200?q=tools',
    type: 'segmented',
    segment: 'search',
    link: '#',
    active: false,
    advertiserName: 'Tools BR',
    planLevel: 'Ouro',
    country: 'BR',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    status: 'expired',
    isConstruction: true,
    views: 780,
    clicks: 45,
    likes: 8,
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
          views: 0,
          clicks: 0,
          likes: 0,
          dislikes: 0,
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
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id
          ? { ...ad, endDate: newEndDate, status: 'active', active: true }
          : ad,
      ),
    })),
  getAdsBySegment: (segment) => {
    const { ads } = get()
    const segmentAds = ads.filter(
      (ad) => ad.active && (ad.segment === segment || ad.segment === 'all'),
    )
    const shuffled = [...segmentAds].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 2)
  },
}))
