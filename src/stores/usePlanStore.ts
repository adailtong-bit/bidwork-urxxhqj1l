import { create } from 'zustand'

export interface Plan {
  id: string
  title: string
  description: string
  owner: string
  deadline: Date
  status: 'Em Progresso' | 'Atrasado' | 'Concluído' | 'Planejamento'
  progress: number
  category: 'Marketing' | 'Vendas' | 'Desenvolvimento' | 'RH' | 'Financeiro'
  budget: number
  createdAt: Date
}

interface PlanState {
  plans: Plan[]
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => void
  updatePlan: (id: string, plan: Partial<Plan>) => void
  deletePlan: (id: string) => void
  getPlan: (id: string) => Plan | undefined
}

const mockPlans: Plan[] = [
  {
    id: '1',
    title: 'Lançamento Q3',
    description:
      'Planejamento estratégico para o lançamento do produto no terceiro trimestre.',
    owner: 'Usuário Demo',
    deadline: new Date('2024-09-30'),
    status: 'Em Progresso',
    progress: 65,
    category: 'Marketing',
    budget: 50000,
    createdAt: new Date('2024-06-01'),
  },
  {
    id: '2',
    title: 'Reestruturação Financeira',
    description:
      'Análise e reestruturação dos processos financeiros da empresa.',
    owner: 'Carlos Silva',
    deadline: new Date('2024-08-15'),
    status: 'Atrasado',
    progress: 30,
    category: 'Financeiro',
    budget: 15000,
    createdAt: new Date('2024-05-20'),
  },
  {
    id: '3',
    title: 'Contratação Tech Lead',
    description: 'Processo seletivo para nova liderança técnica.',
    owner: 'Ana Paula',
    deadline: new Date('2024-07-01'),
    status: 'Concluído',
    progress: 100,
    category: 'RH',
    budget: 5000,
    createdAt: new Date('2024-04-10'),
  },
  {
    id: '4',
    title: 'Expansão Regional',
    description: 'Plano de expansão para a região sul.',
    owner: 'Roberto Dias',
    deadline: new Date('2024-12-20'),
    status: 'Planejamento',
    progress: 10,
    category: 'Vendas',
    budget: 120000,
    createdAt: new Date('2024-06-15'),
  },
  {
    id: '5',
    title: 'Novo Site Institucional',
    description: 'Redesign completo do site corporativo.',
    owner: 'Usuário Demo',
    deadline: new Date('2024-10-01'),
    status: 'Em Progresso',
    progress: 45,
    category: 'Desenvolvimento',
    budget: 25000,
    createdAt: new Date('2024-06-20'),
  },
]

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: mockPlans,
  addPlan: (plan) =>
    set((state) => ({
      plans: [
        {
          ...plan,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        },
        ...state.plans,
      ],
    })),
  updatePlan: (id, updatedPlan) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, ...updatedPlan } : p,
      ),
    })),
  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
    })),
  getPlan: (id) => get().plans.find((p) => p.id === id),
}))
