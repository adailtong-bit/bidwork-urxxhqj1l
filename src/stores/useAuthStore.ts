import { create } from 'zustand'

export type TeamRole =
  | 'Admin'
  | 'Project Manager'
  | 'Accountant'
  | 'Collaborator'

export interface TeamMember {
  id: string
  name: string
  role: TeamRole
  email: string
  avatar: string
  status: 'active' | 'inactive' | 'busy'
  performance: number
}

export interface LoyaltyTransaction {
  id: string
  date: Date
  description: string
  points: number
  type: 'earned' | 'redeemed'
}

export interface Badge {
  id: string
  name: string
  icon: string // Lucide icon name or url
  description: string
  earnedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'contractor' | 'executor' | 'admin' | 'partner'
  teamRole?: TeamRole // Added to support RBAC for team members
  entityType: 'pf' | 'pj'
  businessArea?: string
  category?: string
  reputation: number
  address?: string
  bankingDetails?: {
    bank: string
    agency: string
    account: string
    document: string
  }
  serviceRadius: number
  location: string
  pendingEvaluation?: {
    jobId: string
    targetId: string
    targetName: string
    type: 'contractor_to_executor' | 'executor_to_contractor'
  }
  isPremium: boolean
  subscriptionTier: 'free' | 'pro' | 'business'
  credits: number
  isVerified: boolean
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'
  loyaltyPoints: number
  loyaltyHistory: LoyaltyTransaction[]
  teamMembers?: TeamMember[]
  badges: Badge[]
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: 'contractor' | 'executor' | 'partner'
  entityType: 'pf' | 'pj'
  businessArea?: string
  category?: string
  address: string
  bankingDetails?: {
    bank: string
    agency: string
    account: string
    document: string
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
  updateUserReputation: (newScore: number) => void
  updateSettings: (settings: Partial<User>) => void
  clearPendingEvaluation: () => void
  setPendingEvaluation: (evaluation: User['pendingEvaluation']) => void
  buyCredits: (amount: number) => void
  upgradeSubscription: (tier: 'pro' | 'business') => void
  submitKYC: (file: File) => Promise<void>
  addTeamMember: (
    member: Omit<TeamMember, 'id' | 'avatar' | 'status' | 'performance'>,
  ) => void
  removeTeamMember: (id: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 800))

    let role: 'contractor' | 'executor' | 'admin' | 'partner' = 'contractor'
    let teamRole: TeamRole | undefined = undefined
    let entityType: 'pf' | 'pj' = 'pf'
    let name = 'Usuário Padrão'
    let teamMembers: TeamMember[] | undefined = undefined
    let badges: Badge[] = []

    if (email.includes('executor')) {
      role = 'executor'
      badges = [
        {
          id: 'b1',
          name: 'Fast Delivery',
          icon: 'Zap',
          description: 'Entregou 5 projetos antes do prazo.',
          earnedAt: new Date(Date.now() - 10000000),
        },
        {
          id: 'b2',
          name: '5-Star Pro',
          icon: 'Star',
          description: 'Manteve média 5.0 em 10 jobs.',
          earnedAt: new Date(Date.now() - 5000000),
        },
      ]
    }
    if (email.includes('admin')) role = 'admin'
    if (email.includes('pj')) entityType = 'pj'
    if (email.includes('partner')) {
      role = 'partner'
      entityType = 'pj'
    }

    // PJ Owner Logic
    if (email === 'contractor.pj@bidwork.app') {
      name = 'Construtora Tech Corp'
      role = 'contractor'
      entityType = 'pj'
      teamRole = 'Admin'
      teamMembers = [
        {
          id: 't1',
          name: 'Ana Gerente',
          role: 'Project Manager',
          email: 'ana@techcorp.com',
          avatar:
            'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=10',
          status: 'active',
          performance: 9.5,
        },
        {
          id: 't2',
          name: 'Carlos Engenheiro',
          role: 'Collaborator',
          email: 'carlos@techcorp.com',
          avatar:
            'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=11',
          status: 'busy',
          performance: 8.8,
        },
      ]
    }
    // Accountant Team Member Logic
    else if (email === 'accountant.pj@bidwork.app') {
      name = 'Marcos Contador'
      role = 'contractor' // Part of a contractor company
      entityType = 'pj'
      teamRole = 'Accountant' // RBAC Key
    }
    // Project Manager Team Member Logic
    else if (email === 'manager.pj@bidwork.app') {
      name = 'Ana Gerente'
      role = 'contractor'
      entityType = 'pj'
      teamRole = 'Project Manager' // RBAC Key
    } else if (email === 'executor.pj@bidwork.app') {
      name = 'Soluções Rápidas Ltda'
      role = 'executor'
      entityType = 'pj'
      teamMembers = [
        {
          id: 't3',
          name: 'Marcos Técnico',
          role: 'Collaborator',
          email: 'marcos@solucoes.com',
          avatar:
            'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=12',
          status: 'active',
          performance: 9.2,
        },
        {
          id: 't4',
          name: 'Julia Assistente',
          role: 'Collaborator',
          email: 'julia@solucoes.com',
          avatar:
            'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=13',
          status: 'active',
          performance: 9.0,
        },
      ]
    } else if (email === 'partner@bidwork.app') {
      name = 'Parceiro Construções Ltda'
      role = 'partner'
      entityType = 'pj'
    } else if (email === 'executor.pf@bidwork.app') {
      name = 'João Freelancer'
      role = 'executor'
      entityType = 'pf'
    } else if (email === 'contractor.pf@bidwork.app') {
      name = 'Maria Contratante'
      role = 'contractor'
      entityType = 'pf'
    } else if (email === 'admin@bidwork.app') {
      name = 'Administrador do Sistema'
      role = 'admin'
    }

    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: Math.random().toString(36),
        name,
        email,
        avatar: `https://img.usecurling.com/ppl/medium?seed=${email.length}`,
        role,
        teamRole,
        entityType,
        reputation: 4.8,
        serviceRadius: 50,
        location: 'SP',
        isPremium: entityType === 'pj',
        subscriptionTier: entityType === 'pj' ? 'business' : 'free',
        credits: 100,
        isVerified: true,
        kycStatus: 'verified',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        category: role === 'executor' ? 'TI e Programação' : undefined,
        bankingDetails: {
          bank: 'Test Bank',
          agency: '0001',
          account: '12345-6',
          document: '12.345.678/0001-99',
        },
        loyaltyPoints: 1250,
        loyaltyHistory: [
          {
            id: 'l1',
            date: new Date(Date.now() - 86400000 * 2),
            description: 'Job Finalizado com 5 estrelas',
            points: 100,
            type: 'earned',
          },
        ],
        teamMembers,
        badges,
      },
    })
  },
  register: async (data) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1500))
    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: Math.random().toString(36),
        name: data.name,
        email: data.email,
        avatar: `https://img.usecurling.com/ppl/medium?seed=${Math.floor(Math.random() * 100)}`,
        role: data.role,
        entityType: data.entityType,
        businessArea: data.businessArea,
        category: data.category,
        address: data.address,
        bankingDetails: data.bankingDetails,
        reputation: 0,
        serviceRadius: 50,
        location: 'SP',
        isPremium: false,
        subscriptionTier: 'free',
        credits: 0,
        isVerified: false,
        kycStatus: 'none',
        loyaltyPoints: 0,
        loyaltyHistory: [],
        badges: [],
      },
    })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
  updateUserReputation: (newScore) =>
    set((state) => ({
      user: state.user ? { ...state.user, reputation: newScore } : null,
    })),
  updateSettings: (settings) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...settings } : null,
    })),
  clearPendingEvaluation: () =>
    set((state) => ({
      user: state.user ? { ...state.user, pendingEvaluation: undefined } : null,
    })),
  setPendingEvaluation: (evaluation) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, pendingEvaluation: evaluation }
        : null,
    })),
  buyCredits: (amount) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, credits: (state.user.credits || 0) + amount }
        : null,
    })),
  upgradeSubscription: (tier) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, subscriptionTier: tier, isPremium: true }
        : null,
    })),
  submitKYC: async (file) => {
    set((state) => ({
      user: state.user ? { ...state.user, kycStatus: 'pending' } : null,
    }))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    set((state) => ({
      user: state.user
        ? { ...state.user, kycStatus: 'verified', isVerified: true }
        : null,
    }))
  },
  addTeamMember: (member) =>
    set((state) => {
      if (!state.user || !state.user.teamMembers) return state
      const newMember: TeamMember = {
        ...member,
        id: Math.random().toString(36).substr(2, 9),
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${Math.random()}`,
        status: 'active',
        performance: 0,
      }
      return {
        user: {
          ...state.user,
          teamMembers: [...state.user.teamMembers, newMember],
        },
      }
    }),
  removeTeamMember: (id) =>
    set((state) => {
      if (!state.user || !state.user.teamMembers) return state
      return {
        user: {
          ...state.user,
          teamMembers: state.user.teamMembers.filter((m) => m.id !== id),
        },
      }
    }),
}))
