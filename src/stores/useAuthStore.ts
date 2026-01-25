import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'contractor' | 'executor' | 'admin'
  entityType: 'pf' | 'pj'
  reputation: number
  // New fields
  bankingDetails?: {
    bank: string
    agency: string
    account: string
    document: string // CPF/CNPJ (encrypted concept)
  }
  serviceRadius: number // in miles
  location: string // State code for ads
  pendingEvaluation?: {
    jobId: string
    targetId: string
    targetName: string
    type: 'contractor_to_executor' | 'executor_to_contractor'
  }
  isPremium: boolean // For visibility hierarchy
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (
    name: string,
    email: string,
    password: string,
    role: 'contractor' | 'executor',
    entityType: 'pf' | 'pj',
  ) => Promise<void>
  updateUserReputation: (newScore: number) => void
  updateSettings: (settings: Partial<User>) => void
  clearPendingEvaluation: () => void
  setPendingEvaluation: (evaluation: User['pendingEvaluation']) => void
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
        // Mock a pending evaluation for demo if email contains 'pending'
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
      },
    })
  },
  register: async (name, email, password, role, entityType) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1500))
    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: Math.random().toString(36),
        name,
        email,
        avatar: `https://img.usecurling.com/ppl/medium?seed=${Math.floor(Math.random() * 100)}`,
        role,
        entityType,
        reputation: 0,
        serviceRadius: 50,
        location: 'SP',
        isPremium: false,
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
}))
