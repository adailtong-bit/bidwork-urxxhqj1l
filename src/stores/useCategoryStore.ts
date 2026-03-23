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
  addSubCategory: (categoryId: string, name: string) => void
  removeSubCategory: (categoryId: string, subId: string) => void
  updateSubCategory: (categoryId: string, subId: string, name: string) => void
}

const createSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

const createSubCat = (name: string): SubCategory => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  slug: createSlug(name),
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
          slug: createSlug(name),
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
        c.id === id ? { ...c, name, slug: createSlug(name) } : c,
      ),
    })),
  addSubCategory: (categoryId, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subCategories: [...c.subCategories, createSubCat(name)] }
          : c,
      ),
    })),
  removeSubCategory: (categoryId, subId) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.filter((s) => s.id !== subId),
            }
          : c,
      ),
    })),
  updateSubCategory: (categoryId, subId, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.id === subId ? { ...s, name, slug: createSlug(name) } : s,
              ),
            }
          : c,
      ),
    })),
}))
