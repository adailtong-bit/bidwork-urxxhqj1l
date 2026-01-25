import { create } from 'zustand'

export interface Ad {
  id: string
  title: string
  imageUrl: string
  type: 'regional' | 'segmented' // Regional (State) or Segmented (Category)
  region?: string
  category?: string
  link: string
}

interface AdState {
  ads: Ad[]
  getAdsByContext: (region: string, category: string) => Ad[]
}

export const useAdStore = create<AdState>((set, get) => ({
  ads: [
    {
      id: '1',
      title: 'Fornecedor de Materiais SP',
      imageUrl:
        'https://img.usecurling.com/p/300/100?q=construction%20materials',
      type: 'regional',
      region: 'SP',
      link: '#',
    },
    {
      id: '2',
      title: 'Curso de Marketing Digital',
      imageUrl: 'https://img.usecurling.com/p/300/100?q=marketing%20course',
      type: 'segmented',
      category: 'Marketing',
      link: '#',
    },
    {
      id: '3',
      title: 'Seguros para Reformas',
      imageUrl: 'https://img.usecurling.com/p/300/100?q=insurance',
      type: 'segmented',
      category: 'Reformas',
      link: '#',
    },
  ],
  getAdsByContext: (region, category) => {
    const { ads } = get()
    // Simple mock logic to filter ads
    return ads.filter(
      (ad) =>
        (ad.type === 'regional' && ad.region === region) ||
        (ad.type === 'segmented' && ad.category === category),
    )
  },
}))
