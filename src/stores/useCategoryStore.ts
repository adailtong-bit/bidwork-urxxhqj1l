import { create } from 'zustand'

export interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryState {
  categories: Category[]
  addCategory: (name: string) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, name: string) => void
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [
    { id: '1', name: 'TI e Programação', slug: 'ti-programacao' },
    { id: '2', name: 'Reformas', slug: 'reformas' },
    { id: '3', name: 'Design', slug: 'design' },
    { id: '4', name: 'Marketing', slug: 'marketing' },
    { id: '5', name: 'Serviços Domésticos', slug: 'servicos-domesticos' },
    { id: '6', name: 'Enfermagem', slug: 'enfermagem' },
    { id: '7', name: 'Limpeza', slug: 'limpeza' },
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
