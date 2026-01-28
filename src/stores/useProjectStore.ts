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

export interface BimFile {
  id: string
  name: string
  url: string
  type: string
  uploadedAt: Date
  size: string
}

export interface ProjectPartner {
  id: string
  companyName: string
  stageId: string
  agreedPrice: number
  contractUrl?: string
  licensesUrl?: string
  insuranceUrl?: string
  employees: {
    id: string
    name: string
    role: string
  }[]
}

export interface SubStage {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  startDate: Date
  endDate: Date
  progress: number
}

export interface Stage {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  startDate: Date
  endDate: Date
  actualStartDate?: Date
  actualEndDate?: Date
  budgetMaterial: number
  budgetLabor: number
  actualMaterial: number
  actualLabor: number
  description: string
  bimFiles: BimFile[]
  progress: number
  subStages: SubStage[]
}

export interface ProjectAddress {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string
  location: string // Formatted string (City - State) for display
  address: ProjectAddress // Detailed address
  startDate: Date
  endDate: Date
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  stages: Stage[]
  partners: ProjectPartner[]
  totalBudget: number
  totalSpent: number
}

interface ProjectState {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'totalSpent' | 'partners'>) => void
  updateProject: (id: string, data: Partial<Project>) => void
  addStage: (
    projectId: string,
    stage: Omit<
      Stage,
      | 'id'
      | 'actualMaterial'
      | 'actualLabor'
      | 'bimFiles'
      | 'progress'
      | 'subStages'
    >,
  ) => void
  updateStage: (
    projectId: string,
    stageId: string,
    data: Partial<Stage>,
  ) => void
  addSubStage: (
    projectId: string,
    stageId: string,
    subStage: Omit<SubStage, 'id'>,
  ) => void
  updateSubStage: (
    projectId: string,
    stageId: string,
    subStageId: string,
    data: Partial<SubStage>,
  ) => void
  updateStageActuals: (
    projectId: string,
    stageId: string,
    type: 'material' | 'labor',
    amount: number,
  ) => void
  importExternalBudget: (
    projectId: string,
    budgetData: { stageName: string; material: number; labor: number }[],
  ) => void
  importTimeline: (
    projectId: string,
    timelineData: {
      level: number
      name: string
      startDate: Date
      endDate: Date
      progress: number
    }[],
  ) => void
  addBimFile: (projectId: string, stageId: string, file: BimFile) => void
  addPartner: (projectId: string, partner: Omit<ProjectPartner, 'id'>) => void
  getProject: (id: string) => Project | undefined
}

export const DEFAULT_STAGES_TEMPLATE = [
  {
    name: '1. Compra do Terreno',
    description: 'Pesquisa, Seleção, Zonas e Licenças.',
  },
  {
    name: '2. Planejamento e Projeto',
    description: 'Contratação, Desenvolvimento do Projeto.',
  },
  {
    name: '3. Obtenção de Licenças',
    description: 'Licenças de Construção, Permissões.',
  },
  {
    name: '4. Preparação do Terreno',
    description: 'Limpeza, Nivelamento, Fundação.',
  },
  {
    name: '5. Construção Estrutural',
    description: 'Estrutura, Telhado, Encanamento, Elétrica.',
  },
  {
    name: '6. Acabamentos Internos e Externos',
    description: 'Isolamento, Drywall, Pisos, Pintura.',
  },
  {
    name: '7. Instalações Finais',
    description: 'Iluminação, Tomadas, Louças, Bancadas.',
  },
  {
    name: '8. Aparelhos e Móveis',
    description: 'Eletrodomésticos, Móveis Embutidos.',
  },
  {
    name: '9. Acabamentos Externos',
    description: 'Revestimento Externo, Calçadas, Paisagismo.',
  },
  {
    name: '10. Inspeções e Aprovações Finais',
    description: 'Inspeções, Habite-se.',
  },
  {
    name: '11. Mudança, Manutenção e Limpeza',
    description: 'Mudança, Limpeza Final, Correções.',
  },
]

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    ownerId: 'owner-1',
    name: 'Residencial Alphaville',
    description:
      'Construção de residência de alto padrão com 4 suítes e área de lazer.',
    location: 'Barueri - SP',
    address: {
      zipCode: '06454-000',
      street: 'Alameda Rio Negro',
      number: '500',
      complement: '',
      neighborhood: 'Alphaville',
      city: 'Barueri',
      state: 'SP',
    },
    startDate: new Date(Date.now() - 86400000 * 30),
    endDate: new Date(Date.now() + 86400000 * 180),
    status: 'in_progress',
    totalBudget: 1500000,
    totalSpent: 350000,
    partners: [],
    stages: [
      {
        id: 'st-1',
        name: '4. Preparação do Terreno',
        status: 'completed',
        startDate: new Date(Date.now() - 86400000 * 30),
        endDate: new Date(Date.now() - 86400000 * 5),
        actualStartDate: new Date(Date.now() - 86400000 * 28),
        actualEndDate: new Date(Date.now() - 86400000 * 4),
        budgetMaterial: 80000,
        budgetLabor: 40000,
        actualMaterial: 82000,
        actualLabor: 38000,
        description: 'Terraplanagem, sapatas e vigas baldrame.',
        progress: 100,
        subStages: [
          {
            id: 'sub-1',
            name: 'Terraplanagem',
            startDate: new Date(Date.now() - 86400000 * 30),
            endDate: new Date(Date.now() - 86400000 * 20),
            progress: 100,
            status: 'completed',
          },
          {
            id: 'sub-2',
            name: 'Fundações',
            startDate: new Date(Date.now() - 86400000 * 19),
            endDate: new Date(Date.now() - 86400000 * 5),
            progress: 100,
            status: 'completed',
          },
        ],
        bimFiles: [
          {
            id: 'bim-1',
            name: 'Projeto_Fundacao_V3.ifc',
            url: '#',
            type: 'IFC',
            size: '12MB',
            uploadedAt: new Date(Date.now() - 86400000 * 35),
          },
        ],
      },
      {
        id: 'st-2',
        name: '5. Construção Estrutural',
        status: 'in_progress',
        startDate: new Date(Date.now() - 86400000 * 4),
        endDate: new Date(Date.now() + 86400000 * 45),
        actualStartDate: new Date(Date.now() - 86400000 * 3),
        budgetMaterial: 150000,
        budgetLabor: 90000,
        actualMaterial: 45000,
        actualLabor: 20000,
        description: 'Levantamento de paredes, pilares e lajes.',
        progress: 35,
        subStages: [
          {
            id: 'sub-3',
            name: 'Pilares Térreo',
            startDate: new Date(Date.now() - 86400000 * 4),
            endDate: new Date(Date.now() + 86400000 * 10),
            progress: 70,
            status: 'in_progress',
          },
          {
            id: 'sub-4',
            name: 'Laje 1º Pavimento',
            startDate: new Date(Date.now() + 86400000 * 11),
            endDate: new Date(Date.now() + 86400000 * 25),
            progress: 0,
            status: 'pending',
          },
        ],
        bimFiles: [],
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
          partners: [],
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
                bimFiles: [],
                progress: 0,
                subStages: [],
              },
            ],
          }
        }
        return p
      }),
    })),
  updateStage: (projectId, stageId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: p.stages.map((s) =>
              s.id === stageId ? { ...s, ...data } : s,
            ),
          }
        }
        return p
      }),
    })),
  addSubStage: (projectId, stageId, subStage) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: p.stages.map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: [
                    ...s.subStages,
                    {
                      ...subStage,
                      id: Math.random().toString(36).substr(2, 9),
                    },
                  ],
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  updateSubStage: (projectId, stageId, subStageId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: p.stages.map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: s.subStages.map((sub) =>
                    sub.id === subStageId ? { ...sub, ...data } : sub,
                  ),
                }
              }
              return s
            }),
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
          const totalSpent = newStages.reduce(
            (acc, s) => acc + s.actualMaterial + s.actualLabor,
            0,
          )
          return { ...p, stages: newStages, totalSpent }
        }
        return p
      }),
    })),
  importExternalBudget: (projectId, budgetData) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newStages = p.stages.map((s) => {
            const external = budgetData.find(
              (b) =>
                b.stageName.includes(s.name) || s.name.includes(b.stageName),
            )
            if (external) {
              return {
                ...s,
                budgetMaterial: external.material,
                budgetLabor: external.labor,
              }
            }
            return s
          })
          const totalBudget = newStages.reduce(
            (acc, s) => acc + s.budgetMaterial + s.budgetLabor,
            0,
          )
          return { ...p, stages: newStages, totalBudget }
        }
        return p
      }),
    })),
  importTimeline: (projectId, timelineData) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          let currentStageIndex = -1
          const newStages = [...p.stages]

          timelineData.forEach((item) => {
            if (item.level === 1) {
              // Try to find stage by fuzzy name match or just update logic
              const existingIndex = newStages.findIndex(
                (s) =>
                  s.name.toLowerCase().includes(item.name.toLowerCase()) ||
                  item.name.toLowerCase().includes(s.name.toLowerCase()),
              )

              if (existingIndex >= 0) {
                currentStageIndex = existingIndex
                newStages[existingIndex] = {
                  ...newStages[existingIndex],
                  startDate: item.startDate,
                  endDate: item.endDate,
                  progress: item.progress,
                }
              } else {
                // Create new stage if not found? For now let's skip to avoid duplicates
                // or just ignore if strict matching is required
                currentStageIndex = -1
              }
            } else if (item.level === 2 && currentStageIndex >= 0) {
              // Add or Update SubStage
              const stage = newStages[currentStageIndex]
              const existingSubIndex = stage.subStages.findIndex(
                (ss) => ss.name === item.name,
              )

              if (existingSubIndex >= 0) {
                const updatedSubStages = [...stage.subStages]
                updatedSubStages[existingSubIndex] = {
                  ...updatedSubStages[existingSubIndex],
                  startDate: item.startDate,
                  endDate: item.endDate,
                  progress: item.progress,
                }
                newStages[currentStageIndex] = {
                  ...stage,
                  subStages: updatedSubStages,
                }
              } else {
                const newSubStage: SubStage = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: item.name,
                  startDate: item.startDate,
                  endDate: item.endDate,
                  progress: item.progress,
                  status:
                    item.progress === 100
                      ? 'completed'
                      : item.progress > 0
                        ? 'in_progress'
                        : 'pending',
                }
                newStages[currentStageIndex] = {
                  ...stage,
                  subStages: [...stage.subStages, newSubStage],
                }
              }
            }
          })

          // Only update if we found matches
          if (newStages.length > 0) {
            const dates = newStages.flatMap((s) => [
              s.startDate.getTime(),
              s.endDate.getTime(),
            ])
            const minDate = new Date(Math.min(...dates))
            const maxDate = new Date(Math.max(...dates))
            return {
              ...p,
              stages: newStages,
              startDate: minDate,
              endDate: maxDate,
            }
          }
        }
        return p
      }),
    })),
  addBimFile: (projectId, stageId, file) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: p.stages.map((s) =>
              s.id === stageId ? { ...s, bimFiles: [...s.bimFiles, file] } : s,
            ),
          }
        }
        return p
      }),
    })),
  addPartner: (projectId, partner) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: [
              ...p.partners,
              { ...partner, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
  getProject: (id) => get().projects.find((p) => p.id === id),
}))
