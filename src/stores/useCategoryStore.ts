import { create } from 'zustand'

export interface SubCategory {
  id: string
  name: string
  slug: string
}

export type CategoryType =
  | 'job'
  | 'marketplace'
  | 'rental'
  | 'donation'
  | 'other'

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  subCategories: SubCategory[]
}

interface CategoryState {
  categories: Category[]
  addCategory: (name: string, type?: CategoryType) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, name: string, type?: CategoryType) => void
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
      type: 'job',
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
      type: 'job',
      subCategories: [
        createSubCat('Alvenaria'),
        createSubCat('Telhados'),
        createSubCat('Fundação'),
        createSubCat('Ferragem'),
      ],
    },
    {
      id: '3',
      name: 'TI e Programação',
      slug: 'ti-e-programacao',
      type: 'job',
      subCategories: [
        createSubCat('Desenvolvimento Web'),
        createSubCat('Aplicativos Mobile'),
        createSubCat('Design UI/UX'),
        createSubCat('Suporte de TI'),
      ],
    },
    {
      id: '4',
      name: 'Design',
      slug: 'design',
      type: 'job',
      subCategories: [
        createSubCat('Identidade Visual'),
        createSubCat('Web Design'),
        createSubCat('Ilustração'),
      ],
    },
    {
      id: '5',
      name: 'Marketing',
      slug: 'marketing',
      type: 'job',
      subCategories: [
        createSubCat('SEO'),
        createSubCat('Gestão de Tráfego'),
        createSubCat('Social Media'),
      ],
    },
    {
      id: '6',
      name: 'Vendas e Produtos',
      slug: 'vendas',
      type: 'marketplace',
      subCategories: [
        createSubCat('Eletrônicos'),
        createSubCat('Móveis'),
        createSubCat('Ferramentas'),
      ],
    },
    {
      id: '7',
      name: 'Locações',
      slug: 'locacoes',
      type: 'rental',
      subCategories: [
        createSubCat('Equipamentos'),
        createSubCat('Veículos'),
        createSubCat('Espaços'),
      ],
    },
    {
      id: '8',
      name: 'Doação',
      slug: 'doacao',
      type: 'donation',
      subCategories: [
        createSubCat('Materiais Sobrantes'),
        createSubCat('Roupas e EPIs'),
      ],
    },
  ],
  addCategory: (name, type = 'job') =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          id: Math.random().toString(36).substr(2, 9),
          name,
          slug: createSlug(name),
          type,
          subCategories: [],
        },
      ],
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
  updateCategory: (id, name, type) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id
          ? { ...c, name, slug: createSlug(name), type: type || c.type }
          : c,
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
