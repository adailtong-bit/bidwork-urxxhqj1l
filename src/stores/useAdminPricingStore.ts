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

  // Push Notification Rules
  pushEnabled?: boolean
  pushLeadTimeHours?: number
  pushMessageText?: string

  // Priority & Visibility
  priorityWeight?: number
  earlyAccessHours?: number
  visibilityBoost?: number

  // Skill Logic
  skillMatchingRule?: 'strict' | 'flexible' | 'all'
  skillWeight?: number
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
      name: 'Básico',
      description: 'Essencial para autônomos.',
      price: 0,
      features: ['Acesso a jobs básicos', 'Perfil padrão'],
      targetAudience: 'executor',
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      pushEnabled: false,
      priorityWeight: 1,
      earlyAccessHours: 0,
      skillMatchingRule: 'strict',
      skillWeight: 1,
    },
    {
      id: 'plan-exec-pro',
      name: 'Premium',
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
      pushEnabled: true,
      pushLeadTimeHours: 24,
      pushMessageText:
        'Vagas exclusivas liberadas! Confira agora com seu acesso antecipado.',
      priorityWeight: 10,
      earlyAccessHours: 24,
      skillMatchingRule: 'flexible',
      skillWeight: 8,
    },
    {
      id: 'plan-adv-pro',
      name: 'Ouro',
      description: 'Mais alcance para suas vagas.',
      price: 99.9,
      features: ['Anúncios no topo', 'Sem limites de jobs criados'],
      targetAudience: 'advertiser',
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      visibilityBoost: 5,
      pushEnabled: true,
      pushLeadTimeHours: 12,
      pushMessageText: 'Seus anúncios Ouro estão com alta visualização hoje.',
    },
    {
      id: 'plan-cont-pro',
      name: 'Enterprise',
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
      priorityWeight: 20,
      pushEnabled: true,
      pushLeadTimeHours: 48,
      pushMessageText:
        'Resumo das suas obras Enterprise disponível. Verifique o dashboard.',
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
