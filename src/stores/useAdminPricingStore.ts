import { create } from 'zustand'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  popular?: boolean
}

interface AdminPricingState {
  plans: SubscriptionPlan[]
  addPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void
  updatePlan: (id: string, plan: Partial<SubscriptionPlan>) => void
  deletePlan: (id: string) => void
}

export const useAdminPricingStore = create<AdminPricingState>((set) => ({
  plans: [
    {
      id: 'plan-basic',
      name: 'Basic',
      description: 'Essencial para autônomos e pequenos projetos.',
      price: 0,
      features: [
        'Acesso a jobs básicos',
        'Perfil padrão',
        'Taxa de serviço de 15%',
        'Suporte por email',
      ],
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      description: 'Perfeito para freelancers ativos e contratantes regulares.',
      price: 49.9,
      features: [
        'Destaque Regional em buscas',
        'Taxa de serviço reduzida (10%)',
        'Relatórios de desempenho',
        '50 Créditos mensais para lances',
      ],
      popular: true,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      description: 'Gestão completa para construtoras e agências.',
      price: 149.9,
      features: [
        'Destaque Nacional em buscas',
        'Taxa de serviço mínima (5%)',
        'Dashboards avançados de mercado',
        'Créditos ilimitados para lances',
        'Gerente de conta dedicado',
      ],
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
