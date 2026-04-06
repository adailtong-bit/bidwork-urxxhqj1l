import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export type TeamRole =
  | 'Admin'
  | 'Project Manager'
  | 'Accountant'
  | 'Collaborator'
  | 'Financial'
  | 'Manager'
  | 'Document Management'
  | 'License Manager'

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

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: 'BR' | 'US'
}

export interface ConstructionSubscription {
  active: boolean
  basePrice: number
  franchiseeMarkup: number
  projectLimit: number
  activeProjects: number
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  taxId?: string // CPF or CNPJ
  avatar?: string
  role: 'contractor' | 'executor' | 'admin' | 'partner'
  teamRole?: TeamRole
  entityType: 'pf' | 'pj'
  companyName?: string // For PJ
  businessArea?: string
  category?: string
  reputation: number
  address?: Address
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
  planName?: 'Básico' | 'Bronze' | 'Prata' | 'Ouro' | 'Premium' | 'Enterprise'
  constructionSubscription?: ConstructionSubscription
  credits: number
  isVerified: boolean
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'
  loyaltyPoints: number
  loyaltyHistory: LoyaltyTransaction[]
  teamMembers?: TeamMember[]
  badges: Badge[]
  openChat: boolean
  notificationPreferences?: {
    emailInterests: boolean
    pushInterests: boolean
  }
}

export interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role: 'contractor' | 'executor' | 'partner'
  entityType: 'pf' | 'pj'
  businessArea?: string
  category?: string
  address: Address
  taxId?: string
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
  setDomainUser: (user: Partial<User> | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateUserReputation: (newScore: number) => void
  updateSettings: (settings: Partial<User>) => void
  clearPendingEvaluation: () => void
  setPendingEvaluation: (evaluation: User['pendingEvaluation']) => void
  buyCredits: (amount: number) => void
  upgradeSubscription: (tier: 'pro' | 'business') => void
  activateConstructionSubscription: (details?: {
    limit: number
    price: number
  }) => void
  submitKYC: (file: File) => Promise<void>
  addTeamMember: (
    member: Omit<TeamMember, 'id' | 'avatar' | 'performance'>,
  ) => void
  removeTeamMember: (id: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setDomainUser: (userData) => {
    if (!userData) {
      set({ user: null, isAuthenticated: false })
      return
    }

    set({
      isAuthenticated: true,
      user: {
        id: userData.id || Math.random().toString(36).substr(2, 9),
        name: userData.name || 'Usuário',
        email: userData.email || '',
        role: userData.role || 'contractor',
        entityType: userData.entityType || 'pf',
        reputation: userData.reputation || 4.8,
        serviceRadius: userData.serviceRadius || 50,
        location: userData.location || 'São Paulo - SP',
        isPremium: userData.isPremium || false,
        subscriptionTier: userData.subscriptionTier || 'free',
        planName: userData.planName || 'Básico',
        credits: userData.credits || 100,
        isVerified: userData.isVerified || true,
        kycStatus: userData.kycStatus || 'verified',
        loyaltyPoints: userData.loyaltyPoints || 1250,
        loyaltyHistory: userData.loyaltyHistory || [],
        badges: userData.badges || [],
        openChat: userData.openChat || false,
        teamMembers: userData.teamMembers || [],
        address: userData.address || {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          country: 'BR',
        },
        ...userData,
      } as User,
    })
  },
  login: async (email, password) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 800))

    let id = Math.random().toString(36).substr(2, 9)
    let role: 'contractor' | 'executor' | 'admin' | 'partner' = 'contractor'
    let teamRole: TeamRole | undefined = undefined
    let entityType: 'pf' | 'pj' = 'pf'
    let name = 'Usuário Padrão'
    let companyName = ''
    let teamMembers: TeamMember[] | undefined = undefined
    let badges: Badge[] = []
    let taxId = '000.000.000-00'
    let phone = '(11) 99999-9999'
    let constructionSubscription: ConstructionSubscription | undefined =
      undefined
    let planName: User['planName'] = 'Básico'
    let subscriptionTier: User['subscriptionTier'] = 'free'

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
      id = 'owner-1'
      name = 'Admin Tech Corp'
      companyName = 'Construtora Tech Corp'
      taxId = '12.345.678/0001-90'
      role = 'contractor'
      entityType = 'pj'
      teamRole = 'Admin'
      planName = 'Enterprise'
      subscriptionTier = 'business'
      constructionSubscription = {
        active: true,
        basePrice: 500,
        franchiseeMarkup: 50,
        projectLimit: 10,
        activeProjects: 3,
      }
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
      ]
    } else if (email === 'executor.pj@bidwork.app') {
      id = 'exec-pj-1'
      name = 'Soluções Rápidas Ltda'
      companyName = 'Soluções Rápidas Ltda'
      taxId = '98.765.432/0001-10'
      role = 'executor'
      entityType = 'pj'
      planName = 'Premium'
      subscriptionTier = 'pro'
    } else if (email === 'executor.pf@bidwork.app') {
      id = 'exec-1'
      name = 'João Freelancer'
      taxId = '123.456.789-00'
      role = 'executor'
      entityType = 'pf'
      planName = 'Básico'
    } else if (email === 'admin@bidwork.app') {
      id = 'admin-1'
      name = 'Administrador do Sistema'
      role = 'admin'
      planName = 'Enterprise'
    }

    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id,
        name,
        companyName,
        email,
        phone,
        taxId,
        avatar: `https://img.usecurling.com/ppl/medium?seed=${email.length}`,
        role,
        teamRole,
        entityType,
        reputation: 4.8,
        serviceRadius: 50,
        location: 'São Paulo - SP',
        isPremium: planName !== 'Básico',
        subscriptionTier,
        planName,
        constructionSubscription,
        credits: 100,
        isVerified: true,
        kycStatus: 'verified',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          country: 'BR',
        },
        category: role === 'executor' ? 'TI e Programação' : undefined,
        bankingDetails: {
          bank: 'Test Bank',
          agency: '0001',
          account: '12345-6',
          document: '12.345.678/0001-99',
        },
        loyaltyPoints: 1250,
        loyaltyHistory: [],
        teamMembers,
        badges,
        openChat: false,
        notificationPreferences: {
          emailInterests: true,
          pushInterests: false,
        },
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
        phone: data.phone,
        taxId: data.taxId,
        avatar: `https://img.usecurling.com/ppl/medium?seed=${Math.floor(Math.random() * 100)}`,
        role: data.role,
        entityType: data.entityType,
        businessArea: data.businessArea,
        category: data.category,
        address: data.address,
        bankingDetails: data.bankingDetails,
        reputation: 0,
        serviceRadius: 50,
        location: `${data.address.city} - ${data.address.state}`,
        isPremium: false,
        subscriptionTier: 'free',
        planName: 'Básico',
        credits: 0,
        isVerified: false,
        kycStatus: 'none',
        loyaltyPoints: 0,
        loyaltyHistory: [],
        badges: [],
        openChat: false,
        notificationPreferences: {
          emailInterests: true,
          pushInterests: false,
        },
      },
    })
  },
  logout: async () => {
    await supabase.auth.signOut()
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
  activateConstructionSubscription: (details) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            constructionSubscription: {
              active: true,
              basePrice: details?.price || 500,
              franchiseeMarkup: 50,
              projectLimit: details?.limit || 10,
              activeProjects: 0,
            },
          }
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
      if (!state.user) return state
      const currentMembers = state.user.teamMembers || []
      const newMember: TeamMember = {
        ...member,
        id: Math.random().toString(36).substr(2, 9),
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${Math.random()}`,
        performance: 0,
      }
      return {
        user: {
          ...state.user,
          teamMembers: [...currentMembers, newMember],
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
