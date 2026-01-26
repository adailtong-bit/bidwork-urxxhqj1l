import { create } from 'zustand'

export interface CostItem {
  id: string
  description: string
  amount: number
  type: 'estimated' | 'actual'
  category: 'material' | 'labor'
  date: Date
  sourceId?: string // Job ID or Order ID
}

export interface Stage {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  startDate: Date
  endDate: Date
  budgetMaterial: number
  budgetLabor: number
  actualMaterial: number
  actualLabor: number
  description: string
}

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  stages: Stage[]
  totalBudget: number
  totalSpent: number
}

interface ProjectState {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'totalSpent'>) => void
  updateProject: (id: string, data: Partial<Project>) => void
  addStage: (
    projectId: string,
    stage: Omit<Stage, 'id' | 'actualMaterial' | 'actualLabor'>,
  ) => void
  updateStageActuals: (
    projectId: string,
    stageId: string,
    type: 'material' | 'labor',
    amount: number,
  ) => void
  getProject: (id: string) => Project | undefined
}

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    ownerId: 'owner-1', // Assuming user match for testing
    name: 'Residencial Alphaville',
    description:
      'Construção de residência de alto padrão com 4 suítes e área de lazer.',
    location: 'Barueri, SP',
    startDate: new Date(Date.now() - 86400000 * 30),
    endDate: new Date(Date.now() + 86400000 * 180),
    status: 'in_progress',
    totalBudget: 1500000,
    totalSpent: 350000,
    stages: [
      {
        id: 'st-1',
        name: 'Fundação',
        status: 'completed',
        startDate: new Date(Date.now() - 86400000 * 30),
        endDate: new Date(Date.now() - 86400000 * 5),
        budgetMaterial: 80000,
        budgetLabor: 40000,
        actualMaterial: 82000,
        actualLabor: 38000,
        description: 'Terraplanagem, sapatas e vigas baldrame.',
      },
      {
        id: 'st-2',
        name: 'Alvenaria e Estrutura',
        status: 'in_progress',
        startDate: new Date(Date.now() - 86400000 * 4),
        endDate: new Date(Date.now() + 86400000 * 45),
        budgetMaterial: 150000,
        budgetLabor: 90000,
        actualMaterial: 45000,
        actualLabor: 20000,
        description: 'Levantamento de paredes, pilares e lajes.',
      },
      {
        id: 'st-3',
        name: 'Instalações',
        status: 'pending',
        startDate: new Date(Date.now() + 86400000 * 46),
        endDate: new Date(Date.now() + 86400000 * 90),
        budgetMaterial: 60000,
        budgetLabor: 50000,
        actualMaterial: 0,
        actualLabor: 0,
        description: 'Elétrica, hidráulica e ar condicionado.',
      },
    ],
  },
]

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: mockProjects,
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          totalSpent: 0,
        },
      ],
    })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p,
      ),
    })),
  addStage: (projectId, stage) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: [
              ...p.stages,
              {
                ...stage,
                id: Math.random().toString(36).substr(2, 9),
                actualMaterial: 0,
                actualLabor: 0,
              },
            ],
          }
        }
        return p
      }),
    })),
  updateStageActuals: (projectId, stageId, type, amount) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newStages = p.stages.map((s) => {
            if (s.id === stageId) {
              return {
                ...s,
                actualMaterial:
                  type === 'material'
                    ? s.actualMaterial + amount
                    : s.actualMaterial,
                actualLabor:
                  type === 'labor' ? s.actualLabor + amount : s.actualLabor,
              }
            }
            return s
          })
          // Recalculate total spent
          const totalSpent = newStages.reduce(
            (acc, s) => acc + s.actualMaterial + s.actualLabor,
            0,
          )
          return { ...p, stages: newStages, totalSpent }
        }
        return p
      }),
    })),
  getProject: (id) => get().projects.find((p) => p.id === id),
}))
