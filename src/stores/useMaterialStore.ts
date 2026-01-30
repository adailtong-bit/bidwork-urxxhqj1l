import { create } from 'zustand'

export interface Material {
  id: string
  name: string
  category: string
  price: number
  unit: string
  imageUrl: string
  supplier: string
  stock: number
  description: string
  // New
  supplierWebsite?: string
  purchasePermissions?: string[] // Roles allowed to buy
}

export interface Order {
  id: string
  projectId: string
  stageId: string
  items: { material: Material; quantity: number }[]
  total: number
  freightCost?: number
  status: 'pending' | 'delivered' | 'cancelled'
  date: Date
  arrivalDate?: Date
}

interface MaterialState {
  materials: Material[]
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void
  getMaterials: () => Material[]
  getOrdersByProject: (projectId: string) => Order[]
  updateMaterial: (id: string, data: Partial<Material>) => void
  importMaterialList: (
    file: File,
  ) => Promise<{ success: boolean; count: number }>
}

const mockMaterials: Material[] = [
  {
    id: 'm-1',
    name: 'Cimento CP II 50kg',
    category: 'Estrutura',
    price: 32.9,
    unit: 'saco',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=cement%20bag',
    supplier: 'ConstruMix',
    stock: 500,
    description: 'Cimento Portland composto, ideal para concreto e argamassa.',
    supplierWebsite: 'https://construmix.com.br',
    purchasePermissions: ['Project Manager', 'Admin'],
  },
  {
    id: 'm-2',
    name: 'Tijolo Cerâmico 14x19x29',
    category: 'Alvenaria',
    price: 1.85,
    unit: 'un',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=brick',
    supplier: 'Olaria Silva',
    stock: 10000,
    description: 'Bloco cerâmico de vedação.',
  },
  {
    id: 'm-3',
    name: 'Areia Média (m³)',
    category: 'Estrutura',
    price: 120.0,
    unit: 'm³',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=sand%20pile',
    supplier: 'Areial Porto',
    stock: 50,
    description: 'Areia lavada média para concreto.',
  },
  {
    id: 'm-4',
    name: 'Vergalhão CA-50 10mm',
    category: 'Estrutura',
    price: 45.0,
    unit: 'barra',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=steel%20rebar',
    supplier: 'AçoForte',
    stock: 300,
    description: 'Barra de aço nervurada 12m.',
  },
  {
    id: 'm-5',
    name: 'Tinta Acrílica Branca 18L',
    category: 'Acabamento',
    price: 380.0,
    unit: 'lata',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=paint%20bucket',
    supplier: 'Tintas Color',
    stock: 100,
    description: 'Tinta premium fosca lavável.',
  },
]

export const useMaterialStore = create<MaterialState>((set, get) => ({
  materials: mockMaterials,
  orders: [],
  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date(),
        },
      ],
    })),
  getMaterials: () => get().materials,
  getOrdersByProject: (projectId) =>
    get().orders.filter((o) => o.projectId === projectId),
  updateMaterial: (id, data) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, ...data } : m,
      ),
    })),
  importMaterialList: async (file) => {
    // Mock import
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { success: true, count: 5 }
  },
}))
