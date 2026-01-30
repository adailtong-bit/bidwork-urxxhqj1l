import { create } from 'zustand'

export interface Route {
  id: string
  origin: string
  destination: string
  distance: string
  estimatedTime: string
  status: 'planned' | 'in_transit' | 'completed'
  cost: number
  vehicle: string
  projectId?: string // New
}

interface LogisticsState {
  routes: Route[]
  addRoute: (route: Omit<Route, 'id'>) => void
  updateStatus: (id: string, status: Route['status']) => void
}

const mockRoutes: Route[] = [
  {
    id: 'rt-1',
    origin: 'Fornecedor AçoForte (Osasco)',
    destination: 'Obra Residencial Alphaville (Barueri)',
    distance: '15 km',
    estimatedTime: '35 min',
    status: 'in_transit',
    cost: 150.0,
    vehicle: 'Caminhão Toco',
    projectId: 'proj-1',
  },
]

export const useLogisticsStore = create<LogisticsState>((set) => ({
  routes: mockRoutes,
  addRoute: (route) =>
    set((state) => ({
      routes: [
        ...state.routes,
        { ...route, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      routes: state.routes.map((r) => (r.id === id ? { ...r, status } : r)),
    })),
}))
