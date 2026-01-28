import { create } from 'zustand'

export interface SubCategory {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  subCategories: SubCategory[]
}

interface CategoryState {
  categories: Category[]
  addCategory: (name: string) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, name: string) => void
}

const createSubCat = (name: string): SubCategory => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  slug: name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, ''),
})

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [
    {
      id: '1',
      name: 'Reformas',
      slug: 'reformas',
      subCategories: [
        createSubCat('Pintura'),
        createSubCat('Instalação de Drywall'),
        createSubCat('Instalação de Gabinetes'),
        createSubCat('Eletricista'),
        createSubCat('Colocador de Piso'),
      ],
    },
    {
      id: '2',
      name: 'Construção',
      slug: 'construcao',
      subCategories: [
        createSubCat('Alvenaria'),
        createSubCat('Telhados'),
        createSubCat('Fundação'),
        createSubCat('Ferragem'),
      ],
    },
    {
      id: '3',
      name: 'Tecnologia',
      slug: 'tecnologia',
      subCategories: [
        createSubCat('Desenvolvimento Web'),
        createSubCat('Aplicativos Mobile'),
        createSubCat('Design UI/UX'),
        createSubCat('Suporte de TI'),
      ],
    },
    {
      id: '4',
      name: 'Serviços Domésticos',
      slug: 'servicos-domesticos',
      subCategories: [
        createSubCat('Limpeza Residencial'),
        createSubCat('Jardinagem'),
        createSubCat('Manutenção de Ar-condicionado'),
      ],
    },
    {
      id: '5',
      name: 'Serviços Profissionais',
      slug: 'servicos-profissionais',
      subCategories: [
        createSubCat('Contabilidade'),
        createSubCat('Consultoria Jurídica'),
        createSubCat('Tradução'),
      ],
    },
  ],
  addCategory: (name) =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          id: Math.random().toString(36).substr(2, 9),
          name,
          slug: name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, ''),
          subCategories: [],
        },
      ],
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
  updateCategory: (id, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id
          ? {
              ...c,
              name,
              slug: name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, ''),
            }
          : c,
      ),
    })),
}))
