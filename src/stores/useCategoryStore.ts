import { create } from 'zustand'

export interface SubCategory {
  id: string
  name: string
  slug: string
  translationKey?: string
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
  translationKey?: string
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

const createSubCat = (name: string, translationKey?: string): SubCategory => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  slug: createSlug(name),
  translationKey,
})

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [
    {
      id: '1',
      name: 'Reformas',
      slug: 'reformas',
      type: 'job',
      translationKey: 'category.reform',
      subCategories: [
        createSubCat('Pintura', 'subcat.painting'),
        createSubCat('Instalação de Drywall', 'subcat.drywall'),
        createSubCat('Instalação de Gabinetes', 'subcat.cabinets'),
        createSubCat('Eletricista', 'subcat.electrician'),
        createSubCat('Colocador de Piso', 'subcat.flooring'),
      ],
    },
    {
      id: '2',
      name: 'Construção',
      slug: 'construcao',
      type: 'job',
      translationKey: 'category.construction',
      subCategories: [
        createSubCat('Alvenaria', 'subcat.masonry'),
        createSubCat('Telhados', 'subcat.roofing'),
        createSubCat('Fundação', 'subcat.foundation'),
        createSubCat('Ferragem', 'subcat.ironwork'),
      ],
    },
    {
      id: '3',
      name: 'TI e Programação',
      slug: 'ti-e-programacao',
      type: 'job',
      translationKey: 'category.ti',
      subCategories: [
        createSubCat('Desenvolvimento Web', 'subcat.webdev'),
        createSubCat('Aplicativos Mobile', 'subcat.mobile'),
        createSubCat('Design UI/UX', 'subcat.uiux'),
        createSubCat('Suporte de TI', 'subcat.itsupport'),
      ],
    },
    {
      id: '4',
      name: 'Design',
      slug: 'design',
      type: 'job',
      translationKey: 'category.design',
      subCategories: [
        createSubCat('Identidade Visual', 'subcat.visualid'),
        createSubCat('Web Design', 'subcat.webdesign'),
        createSubCat('Ilustração', 'subcat.illustration'),
      ],
    },
    {
      id: '5',
      name: 'Marketing',
      slug: 'marketing',
      type: 'job',
      translationKey: 'category.marketing',
      subCategories: [
        createSubCat('SEO', 'subcat.seo'),
        createSubCat('Gestão de Tráfego', 'subcat.traffic'),
        createSubCat('Social Media', 'subcat.socialmedia'),
      ],
    },
    {
      id: '6',
      name: 'Vendas e Produtos',
      slug: 'vendas',
      type: 'marketplace',
      translationKey: 'category.sales',
      subCategories: [
        createSubCat('Eletrônicos', 'subcat.electronics'),
        createSubCat('Móveis', 'subcat.furniture'),
        createSubCat('Ferramentas', 'subcat.tools'),
      ],
    },
    {
      id: '7',
      name: 'Locações',
      slug: 'locacoes',
      type: 'rental',
      translationKey: 'category.rental',
      subCategories: [
        createSubCat('Equipamentos', 'subcat.equipment'),
        createSubCat('Veículos', 'subcat.vehicles'),
        createSubCat('Espaços', 'subcat.spaces'),
      ],
    },
    {
      id: '8',
      name: 'Doação',
      slug: 'doacao',
      type: 'donation',
      translationKey: 'category.donation',
      subCategories: [
        createSubCat('Materiais Sobrantes', 'subcat.leftovers'),
        createSubCat('Roupas e EPIs', 'subcat.clothes_ppe'),
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
