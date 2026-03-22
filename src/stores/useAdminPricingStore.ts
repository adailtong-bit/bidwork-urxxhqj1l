import { create } from 'zustand'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'semi-annually' | 'yearly'
  validityDays: number
  features: string[]
  active: boolean
  targetAudience: 'executor' | 'advertiser' | 'contractor'

  // Rules for Contractors
  maxProjects?: number
  workSize?: string
  complexity?: 'Low' | 'Medium' | 'High'

  // Rules for Executors
  pushEnabled?: boolean
  pushLeadTimeHours?: number
  pushMessageText?: string
  priorityWeight?: number
  earlyAccessHours?: number
  skillMatchingRule?: 'strict' | 'flexible' | 'all'
  skillWeight?: number

  // Rules for Advertisers
  visibilityBoost?: number
  popular?: boolean
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
      id: 'plan-1',
      name: 'Básico',
      description: 'Acesso gratuito limitado',
      price: 0,
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      targetAudience: 'executor',
      features: ['Acesso ao mural (com delay)', 'Até 3 propostas/mês'],
      priorityWeight: 1,
      earlyAccessHours: 0,
      skillMatchingRule: 'strict',
      skillWeight: 1,
    },
    {
      id: 'plan-2',
      name: 'Premium',
      description: 'Ideal para profissionais dedicados',
      price: 49.9,
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      targetAudience: 'executor',
      features: [
        'Propostas ilimitadas',
        'Acesso antecipado de 24h',
        'Destaque no perfil',
      ],
      popular: true,
      priorityWeight: 5,
      earlyAccessHours: 24,
      pushEnabled: true,
      pushLeadTimeHours: 1,
      pushMessageText: 'Nova vaga liberada em primeira mão para você!',
      skillMatchingRule: 'flexible',
      skillWeight: 5,
    },
    {
      id: 'plan-contractor-1',
      name: 'Construtora Essential',
      description: 'Gestão básica de obras',
      price: 299.0,
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      targetAudience: 'contractor',
      maxProjects: 3,
      workSize: 'Até 500m²',
      complexity: 'Low',
      features: [
        'Até 3 obras ativas',
        'Controle Financeiro',
        'Medições Simples',
      ],
    },
    {
      id: 'plan-contractor-2',
      name: 'Construtora PRO',
      description: 'Para gestão avançada e múltiplas obras',
      price: 899.0,
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      targetAudience: 'contractor',
      maxProjects: 15,
      workSize: 'Ilimitado',
      complexity: 'Medium',
      popular: true,
      features: [
        'Até 15 obras ativas',
        'Assinatura Digital de Contratos',
        'Gestão de Múltiplos Parceiros',
        'Suporte Prioritário',
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
  togglePlanStatus: (id) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p,
      ),
    })),
}))
