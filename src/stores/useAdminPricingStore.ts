import { create } from 'zustand'

export type TargetAudience = 'executor' | 'advertiser' | 'contractor'
export type BillingCycle = 'monthly' | 'quarterly' | 'semi-annually' | 'yearly'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  popular?: boolean
  targetAudience: TargetAudience
  billingCycle: BillingCycle
  validityDays: number
  active: boolean
  // Contractor specific metadata
  maxProjects?: number
  complexity?: 'Low' | 'Medium' | 'High'
  workSize?: string
}

interface AdminPricingState {
  plans: SubscriptionPlan[]
  addPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void
  updatePlan: (id: string, plan: Partial<SubscriptionPlan>) => void
  deletePlan: (id: string) => void
  togglePlanStatus: (id: string) => void
}

export const useAdminPricingStore = create<AdminPricingState>((set) => ({
  plans: [
    {
      id: 'plan-exec-basic',
      name: 'Basic Executor',
      description: 'Essencial para autônomos.',
      price: 0,
      features: ['Acesso a jobs básicos', 'Perfil padrão'],
      targetAudience: 'executor',
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
    },
    {
      id: 'plan-exec-pro',
      name: 'Pro Executor',
      description: 'Perfeito para freelancers ativos.',
      price: 49.9,
      features: [
        'Destaque Regional em buscas',
        'Taxa de serviço reduzida (10%)',
        '50 Créditos mensais para lances',
      ],
      popular: true,
      targetAudience: 'executor',
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
    },
    {
      id: 'plan-adv-pro',
      name: 'Anunciante Premium',
      description: 'Mais alcance para suas vagas.',
      price: 99.9,
      features: ['Anúncios no topo', 'Sem limites de jobs criados'],
      targetAudience: 'advertiser',
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
    },
    {
      id: 'plan-cont-pro',
      name: 'Construtor Pro',
      description: 'Gestão completa para construtoras.',
      price: 149.9,
      features: ['Dashboard avançado', 'Até 10 obras simultâneas'],
      targetAudience: 'contractor',
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      maxProjects: 10,
      complexity: 'High',
      workSize: 'Grande',
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
  togglePlanStatus: (id) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p,
      ),
    })),
}))
