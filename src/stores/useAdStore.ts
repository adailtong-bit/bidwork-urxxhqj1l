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
  // Metrics
  views: number
  clicks: number
  likes: number
  dislikes: number
}

interface AdState {
  ads: Ad[]
  addAd: (
    ad: Omit<Ad, 'id' | 'views' | 'clicks' | 'likes' | 'dislikes'>,
  ) => void
  removeAd: (id: string) => void
  toggleAdStatus: (id: string) => void
  getAdsBySegment: (segment: string) => Ad[]
  trackView: (id: string) => void
  trackClick: (id: string) => void
  rateAd: (id: string, rating: 'like' | 'dislike') => void
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
      views: 1240,
      clicks: 85,
      likes: 12,
      dislikes: 2,
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
      views: 980,
      clicks: 120,
      likes: 45,
      dislikes: 1,
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
      views: 560,
      clicks: 30,
      likes: 5,
      dislikes: 0,
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
      views: 780,
      clicks: 45,
      likes: 8,
      dislikes: 1,
    },
    {
      id: '5',
      title: 'Software de Gestão',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=software',
      type: 'segmented',
      segment: 'profile',
      link: '#',
      active: true,
      views: 340,
      clicks: 12,
      likes: 3,
      dislikes: 0,
    },
    {
      id: '6',
      title: 'Contabilidade Online',
      imageUrl: 'https://img.usecurling.com/p/600/200?q=accounting',
      type: 'segmented',
      segment: 'profile',
      link: '#',
      active: true,
      views: 410,
      clicks: 22,
      likes: 4,
      dislikes: 1,
    },
  ],
  addAd: (ad) =>
    set((state) => ({
      ads: [
        ...state.ads,
        {
          ...ad,
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
  getAdsBySegment: (segment) => {
    const { ads } = get()
    const segmentAds = ads.filter(
      (ad) => ad.active && (ad.segment === segment || ad.segment === 'all'),
    )

    // Simple pseudo-random shuffle for display variety
    const shuffled = [...segmentAds].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 2)
  },
  trackView: (id) =>
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id ? { ...ad, views: ad.views + 1 } : ad,
      ),
    })),
  trackClick: (id) =>
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id ? { ...ad, clicks: ad.clicks + 1 } : ad,
      ),
    })),
  rateAd: (id, rating) =>
    set((state) => ({
      ads: state.ads.map((ad) => {
        if (ad.id !== id) return ad
        return rating === 'like'
          ? { ...ad, likes: ad.likes + 1 }
          : { ...ad, dislikes: ad.dislikes + 1 }
      }),
    })),
}))
