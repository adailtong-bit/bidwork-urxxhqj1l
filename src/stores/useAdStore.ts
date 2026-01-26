import { create } from 'zustand'

export interface Ad {
  id: string
  title: string
  imageUrl: string
  type: 'regional' | 'segmented'
  segment: 'dashboard' | 'search' | 'profile' | 'all'
  region?: string
  category?: string
  link: string
  active: boolean
}

interface AdState {
  ads: Ad[]
  addAd: (ad: Omit<Ad, 'id'>) => void
  removeAd: (id: string) => void
  toggleAdStatus: (id: string) => void
  getAdsBySegment: (segment: string) => Ad[]
}

export const useAdStore = create<AdState>((set, get) => ({
  ads: [
    {
      id: '1',
      title: 'Materiais de Construção SP',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=construction%20store',
      type: 'regional',
      segment: 'dashboard',
      region: 'SP',
      link: '#',
      active: true,
    },
    {
      id: '2',
      title: 'Curso de React Avançado',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=coding%20course',
      type: 'segmented',
      segment: 'dashboard',
      category: 'TI e Programação',
      link: '#',
      active: true,
    },
    {
      id: '3',
      title: 'Seguros Profissionais',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=insurance',
      type: 'segmented',
      segment: 'search',
      category: 'Reformas',
      link: '#',
      active: true,
    },
    {
      id: '4',
      title: 'Ferramentas Premium',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=power%20tools',
      type: 'segmented',
      segment: 'search',
      category: 'Reformas',
      link: '#',
      active: true,
    },
    {
      id: '5',
      title: 'Software de Gestão',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=software',
      type: 'segmented',
      segment: 'profile',
      link: '#',
      active: true,
    },
    {
      id: '6',
      title: 'Contabilidade Online',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=accounting',
      type: 'segmented',
      segment: 'profile',
      link: '#',
      active: true,
    },
  ],
  addAd: (ad) =>
    set((state) => ({
      ads: [
        ...state.ads,
        { ...ad, id: Math.random().toString(36).substr(2, 9) },
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
  getAdsBySegment: (segment) => {
    const { ads } = get()
    // Filter by segment and active status
    const segmentAds = ads.filter(
      (ad) => ad.active && (ad.segment === segment || ad.segment === 'all'),
    )

    // Return exactly 2 ads if possible, randomizing for variety
    const shuffled = [...segmentAds].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 2)
  },
}))
