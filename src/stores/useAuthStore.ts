import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'contractor' | 'executor' | 'admin'
  entityType: 'pf' | 'pj'
  businessArea?: string // For PJ
  category?: string // For Executors (Electrician, etc.)
  reputation: number
  address?: string
  bankingDetails?: {
    bank: string
    agency: string
    account: string
    document: string // CPF/CNPJ
  }
  serviceRadius: number // in miles
  location: string // State code for ads (e.g., 'SP', 'RJ')
  pendingEvaluation?: {
    jobId: string
    targetId: string
    targetName: string
    type: 'contractor_to_executor' | 'executor_to_contractor'
  }
  isPremium: boolean // For visibility hierarchy
  subscriptionTier: 'free' | 'pro' | 'business'
  credits: number
  isVerified: boolean
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: 'contractor' | 'executor'
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true })
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const isExecutor = email.includes('executor')
    const isPremium = email.includes('premium') // Mock premium logic

    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: isExecutor ? '2' : '1',
        name: isExecutor ? 'João Executor' : 'Maria Contratante',
        email: email,
        avatar: isExecutor
          ? 'https://img.usecurling.com/ppl/medium?gender=male&seed=1'
          : 'https://img.usecurling.com/ppl/medium?gender=female&seed=2',
        role: isExecutor ? 'executor' : 'contractor',
        entityType: 'pf',
        reputation: isExecutor ? 4.8 : 5.0,
        serviceRadius: 10,
        location: 'SP',
        isPremium: isPremium,
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        category: isExecutor ? 'TI e Programação' : undefined,
        pendingEvaluation: email.includes('pending')
          ? {
              jobId: '1',
              targetId: isExecutor ? '1' : '2',
              targetName: isExecutor ? 'Maria Contratante' : 'João Executor',
              type: isExecutor
                ? 'executor_to_contractor'
                : 'contractor_to_executor',
            }
          : undefined,
        subscriptionTier: isPremium ? 'pro' : 'free',
        credits: 50,
        isVerified: isExecutor, // Mock verification
        kycStatus: isExecutor ? 'verified' : 'none',
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
    // Mock processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    set((state) => ({
      user: state.user
        ? { ...state.user, kycStatus: 'verified', isVerified: true }
        : null,
    }))
  },
}))
