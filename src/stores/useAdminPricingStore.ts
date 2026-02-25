import { create } from 'zustand'

export interface ConstructionPlan {
  id: string
  name: string
  description: string
  maxProjects: number
  price: number
  complexity: 'Low' | 'Medium' | 'High'
  workSize: string
}

interface AdminPricingState {
  plans: ConstructionPlan[]
  addPlan: (plan: Omit<ConstructionPlan, 'id'>) => void
  updatePlan: (id: string, plan: Partial<ConstructionPlan>) => void
  deletePlan: (id: string) => void
}

export const useAdminPricingStore = create<AdminPricingState>((set) => ({
  plans: [
    {
      id: 'plan-1',
      name: 'Projeto Pequeno',
      description: 'Ideal para reformas e pequenas construções residenciais.',
      maxProjects: 1,
      price: 199.9,
      complexity: 'Low',
      workSize: 'Até 200m²',
    },
    {
      id: 'plan-2',
      name: 'Projeto Médio',
      description:
        'Perfeito para obras comerciais ou residências de alto padrão.',
      maxProjects: 3,
      price: 499.9,
      complexity: 'Medium',
      workSize: 'Até 500m²',
    },
    {
      id: 'plan-3',
      name: 'Plano Construtora',
      description: 'Gestão completa para múltiplas obras simultâneas.',
      maxProjects: 10,
      price: 1299.9,
      complexity: 'High',
      workSize: 'Ilimitado',
    },
  ],
  addPlan: (plan) =>
    set((state) => ({
      plans: [
        ...state.plans,
        { ...plan, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  updatePlan: (id, plan) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...plan } : p)),
    })),
  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
    })),
}))
