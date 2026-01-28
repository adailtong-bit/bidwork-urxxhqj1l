import { create } from 'zustand'

export interface InventoryItem {
  id: string
  projectId: string
  materialName: string
  quantity: number
  unit: string
  minStock: number
  location: string
  lastUpdated: Date
}

export interface PurchaseRequest {
  id: string
  projectId: string
  materialName: string
  quantity: number
  unit: string
  requestedAt: Date
  status: 'pending' | 'ordered' | 'fulfilled'
}

interface InventoryState {
  items: InventoryItem[]
  purchaseRequests: PurchaseRequest[]
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void
  updateQuantity: (id: string, quantity: number) => void
  updateMinStock: (id: string, minStock: number) => void
  removeItem: (id: string) => void
  reportShortage: (
    request: Omit<PurchaseRequest, 'id' | 'requestedAt' | 'status'>,
  ) => void
  getItemsByProject: (projectId: string) => InventoryItem[]
}

const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    projectId: 'proj-1',
    materialName: 'Cimento CP II',
    quantity: 45,
    unit: 'sacos',
    minStock: 50, // ALERT: Low stock
    location: 'Depósito A - Obra',
    lastUpdated: new Date(),
  },
  {
    id: 'inv-2',
    projectId: 'proj-1',
    materialName: 'Tijolo 14x19x29',
    quantity: 2500,
    unit: 'un',
    minStock: 1000,
    location: 'Pátio Externo',
    lastUpdated: new Date(),
  },
  {
    id: 'inv-3',
    projectId: 'proj-1',
    materialName: 'Areia Média',
    quantity: 2,
    unit: 'm³',
    minStock: 5, // ALERT: Low stock
    location: 'Pátio Externo',
    lastUpdated: new Date(),
  },
]

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: mockInventory,
  purchaseRequests: [],
  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          lastUpdated: new Date(),
        },
      ],
    })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity, lastUpdated: new Date() } : i,
      ),
    })),
  updateMinStock: (id, minStock) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, minStock } : i)),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  reportShortage: (request) =>
    set((state) => ({
      purchaseRequests: [
        ...state.purchaseRequests,
        {
          ...request,
          id: Math.random().toString(36).substr(2, 9),
          requestedAt: new Date(),
          status: 'pending',
        },
      ],
    })),
  getItemsByProject: (projectId) =>
    get().items.filter((i) => i.projectId === projectId),
}))
