import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true })
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock success
    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Usuário Demo',
        email: email,
        avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
        role: 'admin',
      },
    })
  },
  register: async (name, email, password) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1500))
    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '2',
        name,
        email,
        avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=2',
        role: 'user',
      },
    })
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
}))
