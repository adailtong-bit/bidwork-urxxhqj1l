import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'contractor' | 'executor' | 'admin'
  entityType: 'pf' | 'pj'
  reputation: number
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true })
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock success - Determinisitc mock based on email for demo purposes
    const isExecutor = email.includes('executor')

    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '1',
        name: isExecutor ? 'João Executor' : 'Maria Contratante',
        email: email,
        avatar: isExecutor
          ? 'https://img.usecurling.com/ppl/medium?gender=male&seed=1'
          : 'https://img.usecurling.com/ppl/medium?gender=female&seed=2',
        role: isExecutor ? 'executor' : 'contractor',
        entityType: 'pf',
        reputation: isExecutor ? 4.8 : 5.0,
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
        reputation: 0, // New users start with 0 or 5? Let's say 0 (New)
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
}))
