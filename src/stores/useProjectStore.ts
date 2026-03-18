import { create } from 'zustand'

export interface CostItem {
  id: string
  description: string
  amount: number
  type: 'estimated' | 'actual'
  category: 'material' | 'labor' | 'equipment' | 'logistics' | 'other'
  date: Date
  sourceId?: string
}

export interface BimFile {
  id: string
  name: string
  url: string
  type: string
  uploadedAt: Date
  size: string
}

export interface PartnerContact {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

export interface PartnerTeamMember {
  id: string
  name: string
  role: 'Engineer' | 'Electrician' | 'Tiler' | 'Roofer' | 'Other'
  email: string
  phone: string
  registrationId: string
}

export interface ProjectPartner {
  id: string
  companyName: string
  stageId: string
  agreedPrice: number
  contractUrl?: string
  licensesUrl?: string
  insuranceUrl?: string
  contacts: PartnerContact[]
  team: PartnerTeamMember[]
  performanceScore: number
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
  assignedTeamMemberId?: string
  taskPrice?: number
  invoiceStatus?: 'pending' | 'sent_to_partner' | 'sent_to_contractor' | 'paid'
  partnerRating?: number
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
  country?: 'BR' | 'US'
}

export interface BudgetItem {
  id: string
  description: string
  category: 'material' | 'labor' | 'other'
  unitCost: number
  quantity: number
  totalCost: number
}

export interface ApprovalLog {
  id: string
  type: 'invoice' | 'document' | 'activity'
  referenceId: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  date: Date
  history: {
    date: Date
    status: string
    user: string
  }[]
}

export interface Integration {
  platform: 'trello' | 'asana' | 'jira'
  connected: boolean
  lastSync?: Date
}

export interface ConstructionItem {
  id: string
  name: string
  stage: 'M1' | 'M2' | 'M3' | 'M4' | string
  startDate: Date
  endDate: Date
  pricePerSqFt?: number
  totalPrice: number
  isCustom?: boolean
}

export interface LaborAdjustment {
  id: string
  description: string
  amount: number
  date: Date
}

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string
  location: string
  address: ProjectAddress
  startDate: Date
  endDate: Date
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  stages: Stage[]
  partners: ProjectPartner[]
  totalBudget: number
  totalSpent: number
  budgetItems: BudgetItem[]
  approvalLogs: ApprovalLog[]
  integrations: Integration[]
  allocatedCosts?: CostItem[]
  sqFt?: number
  constructionItems: ConstructionItem[]
  laborAdjustments?: LaborAdjustment[]
}

interface ProjectState {
  projects: Project[]
  addProject: (
    project: Omit<
      Project,
      | 'id'
      | 'totalSpent'
      | 'partners'
      | 'budgetItems'
      | 'approvalLogs'
      | 'integrations'
      | 'allocatedCosts'
      | 'constructionItems'
      | 'laborAdjustments'
    >,
  ) => void
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
  deleteStage: (projectId: string, stageId: string) => void
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
  deleteSubStage: (
    projectId: string,
    stageId: string,
    subStageId: string,
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
  addPartner: (
    projectId: string,
    partner: Omit<
      ProjectPartner,
      'id' | 'contacts' | 'team' | 'performanceScore'
    >,
  ) => void
  updatePartner: (
    projectId: string,
    partnerId: string,
    data: Partial<ProjectPartner>,
  ) => void
  addPartnerContact: (
    projectId: string,
    partnerId: string,
    contact: Omit<PartnerContact, 'id'>,
  ) => void
  addPartnerTeamMember: (
    projectId: string,
    partnerId: string,
    member: Omit<PartnerTeamMember, 'id'>,
  ) => void
  removePartnerTeamMember: (
    projectId: string,
    partnerId: string,
    memberId: string,
  ) => void
  reallocateTasks: (
    projectId: string,
    oldMemberId: string,
    newMemberId: string,
  ) => void
  getProject: (id: string) => Project | undefined
  generateInvoice: (
    projectId: string,
    stageId: string,
    subStageId: string,
    type: 'team_to_partner' | 'partner_to_contractor',
  ) => void
  rateTeamMember: (
    projectId: string,
    stageId: string,
    subStageId: string,
    rating: number,
  ) => void
  addBudgetItem: (projectId: string, item: Omit<BudgetItem, 'id'>) => void
  removeBudgetItem: (projectId: string, itemId: string) => void
  updateApprovalStatus: (
    projectId: string,
    approvalId: string,
    status: ApprovalLog['status'],
    user: string,
  ) => void
  toggleIntegration: (
    projectId: string,
    platform: Integration['platform'],
  ) => void
  addAllocatedCost: (projectId: string, cost: Omit<CostItem, 'id'>) => void
  setProjectSqFt: (projectId: string, sqFt: number) => void
  applyTemplate: (projectId: string, items: ConstructionItem[]) => void
  addConstructionItem: (
    projectId: string,
    item: Omit<ConstructionItem, 'id'>,
  ) => void
  updateConstructionItem: (
    projectId: string,
    itemId: string,
    data: Partial<ConstructionItem>,
  ) => void
  removeConstructionItem: (projectId: string, itemId: string) => void
  addLaborAdjustment: (
    projectId: string,
    adjustment: Omit<LaborAdjustment, 'id'>,
  ) => void
}

export const DEFAULT_STAGES_TEMPLATE = [
  {
    name: 'stage.land_purchase',
    description: 'stage.land_purchase_desc',
  },
  {
    name: 'stage.planning',
    description: 'stage.planning_desc',
  },
]

export const ESTIMATION_TEMPLATES = {
  'single-family': [
    { name: 'est.item.excavation', stage: 'M1' },
    { name: 'est.item.foundation_pouring', stage: 'M1' },
    { name: 'est.item.concrete_slab', stage: 'M1' },
    { name: 'est.item.framing', stage: 'M2' },
    { name: 'est.item.roofing', stage: 'M2' },
    { name: 'est.item.windows', stage: 'M2' },
    { name: 'est.item.plumbing_rough', stage: 'M3' },
    { name: 'est.item.electrical_wiring', stage: 'M3' },
    { name: 'est.item.hvac_duct', stage: 'M3' },
    { name: 'est.item.insulation', stage: 'M4' },
    { name: 'est.item.drywall', stage: 'M4' },
    { name: 'est.item.flooring', stage: 'M4' },
    { name: 'est.item.painting', stage: 'M4' },
  ],
  renovation: [
    { name: 'est.item.demolition', stage: 'M1' },
    { name: 'est.item.debris_removal', stage: 'M1' },
    { name: 'est.item.site_prep', stage: 'M1' },
    { name: 'est.item.structural_repairs', stage: 'M2' },
    { name: 'est.item.wall_mod', stage: 'M2' },
    { name: 'est.item.hvac_update', stage: 'M3' },
    { name: 'est.item.panel_upgrade', stage: 'M3' },
    { name: 'est.item.plumbing_fix', stage: 'M3' },
    { name: 'est.item.new_flooring', stage: 'M4' },
    { name: 'est.item.painting', stage: 'M4' },
    { name: 'est.item.cabinets', stage: 'M4' },
  ],
}

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
      country: 'BR',
    },
    startDate: new Date(Date.now() - 86400000 * 30),
    endDate: new Date(Date.now() + 86400000 * 180),
    status: 'in_progress',
    totalBudget: 1500000,
    totalSpent: 350000,
    sqFt: 2500,
    partners: [
      {
        id: 'partner-1',
        companyName: 'Parceiro Construções Ltda',
        stageId: 'st-2',
        agreedPrice: 50000,
        employees: [],
        contacts: [],
        team: [],
        performanceScore: 4.5,
      },
    ],
    stages: [
      {
        id: 'st-1',
        name: '4. Preparação do Terreno',
        status: 'completed',
        startDate: new Date(Date.now() - 86400000 * 30),
        endDate: new Date(Date.now() - 86400000 * 5),
        budgetMaterial: 80000,
        budgetLabor: 40000,
        actualMaterial: 82000,
        actualLabor: 38000,
        description: 'Terraplanagem, sapatas e vigas baldrame.',
        progress: 100,
        subStages: [],
        bimFiles: [],
      },
      {
        id: 'st-2',
        name: '5. Construção Estrutural',
        status: 'in_progress',
        startDate: new Date(Date.now() - 86400000 * 4),
        endDate: new Date(Date.now() + 86400000 * 45),
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
            assignedTeamMemberId: 'member-1',
          },
        ],
        bimFiles: [],
      },
    ],
    budgetItems: [
      {
        id: 'b-1',
        description: 'Cimento CP II (Saco 50kg)',
        category: 'material',
        unitCost: 35.5,
        quantity: 500,
        totalCost: 17750,
      },
      {
        id: 'b-2',
        description: 'Mão de Obra (Pedreiro - Hora)',
        category: 'labor',
        unitCost: 25.0,
        quantity: 1200,
        totalCost: 30000,
      },
    ],
    approvalLogs: [
      {
        id: 'app-1',
        type: 'invoice',
        referenceId: 'inv-001',
        description: 'Pagamento 1ª Parcela - Concretagem',
        status: 'pending',
        date: new Date(),
        history: [],
      },
      {
        id: 'app-2',
        type: 'document',
        referenceId: 'doc-005',
        description: 'Alvará de Construção Atualizado',
        status: 'approved',
        date: new Date(Date.now() - 86400000 * 2),
        history: [
          {
            date: new Date(Date.now() - 86400000 * 2),
            status: 'approved',
            user: 'Eng. Roberto',
          },
        ],
      },
    ],
    integrations: [
      { platform: 'trello', connected: false },
      { platform: 'asana', connected: true, lastSync: new Date() },
      { platform: 'jira', connected: false },
    ],
    allocatedCosts: [],
    constructionItems: [
      {
        id: 'ci-1',
        name: 'est.item.excavation',
        stage: 'M1',
        startDate: new Date(Date.now() - 86400000 * 30),
        endDate: new Date(Date.now() - 86400000 * 25),
        pricePerSqFt: 5,
        totalPrice: 12500,
      },
      {
        id: 'ci-2',
        name: 'est.item.foundation_pouring',
        stage: 'M1',
        startDate: new Date(Date.now() - 86400000 * 20),
        endDate: new Date(Date.now() - 86400000 * 10),
        totalPrice: 25000,
      },
    ],
    laborAdjustments: [
      {
        id: 'adj-1',
        description: 'Horas extras concretagem',
        amount: 3500,
        date: new Date(Date.now() - 86400000 * 3),
      },
    ],
  },
  {
    id: 'proj-2',
    ownerId: 'owner-1',
    name: 'Edifício Comercial Omega',
    description:
      'Construção de prédio comercial de 5 andares com laje protendida.',
    location: 'São Paulo - SP',
    address: {
      zipCode: '01001-000',
      street: 'Praça da Sé',
      number: '100',
      complement: '',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
    },
    startDate: new Date(Date.now() + 86400000 * 10),
    endDate: new Date(Date.now() + 86400000 * 365),
    status: 'planning',
    totalBudget: 5000000,
    totalSpent: 10000,
    sqFt: 15000,
    partners: [],
    stages: [
      {
        id: 'st-2-1',
        name: '1. Projetos e Licenças',
        status: 'in_progress',
        startDate: new Date(Date.now() - 86400000 * 5),
        endDate: new Date(Date.now() + 86400000 * 20),
        budgetMaterial: 5000,
        budgetLabor: 45000,
        actualMaterial: 1000,
        actualLabor: 9000,
        description: 'Aprovação na prefeitura e projetos complementares.',
        progress: 20,
        subStages: [],
        bimFiles: [],
      },
    ],
    budgetItems: [],
    approvalLogs: [],
    integrations: [],
    allocatedCosts: [],
    constructionItems: [],
    laborAdjustments: [],
  },
]

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: mockProjects,
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...(state.projects || []),
        {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          totalSpent: 0,
          partners: [],
          budgetItems: [],
          approvalLogs: [],
          integrations: [],
          allocatedCosts: [],
          constructionItems: [],
          laborAdjustments: [],
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
              ...(p.stages || []),
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
            stages: (p.stages || []).map((s) =>
              s.id === stageId ? { ...s, ...data } : s,
            ),
          }
        }
        return p
      }),
    })),
  deleteStage: (projectId, stageId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).filter((s) => s.id !== stageId),
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
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: [
                    ...(s.subStages || []),
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
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: (s.subStages || []).map((sub) =>
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
  deleteSubStage: (projectId, stageId, subStageId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: (s.subStages || []).filter(
                    (sub) => sub.id !== subStageId,
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
          const newStages = (p.stages || []).map((s) => {
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
          const newStages = (p.stages || []).map((s) => {
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
          return p
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
            stages: (p.stages || []).map((s) =>
              s.id === stageId
                ? { ...s, bimFiles: [...(s.bimFiles || []), file] }
                : s,
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
              ...(p.partners || []),
              {
                ...partner,
                id: Math.random().toString(36).substr(2, 9),
                contacts: [],
                team: [],
                employees: [],
                performanceScore: 0,
              },
            ],
          }
        }
        return p
      }),
    })),
  updatePartner: (projectId, partnerId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) =>
              part.id === partnerId ? { ...part, ...data } : part,
            ),
          }
        }
        return p
      }),
    })),
  addPartnerContact: (projectId, partnerId, contact) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) => {
              if (part.id === partnerId) {
                if (part.contacts.length >= 3) return part
                return {
                  ...part,
                  contacts: [
                    ...(part.contacts || []),
                    { ...contact, id: Math.random().toString(36).substr(2, 9) },
                  ],
                }
              }
              return part
            }),
          }
        }
        return p
      }),
    })),
  addPartnerTeamMember: (projectId, partnerId, member) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) => {
              if (part.id === partnerId) {
                return {
                  ...part,
                  team: [
                    ...(part.team || []),
                    { ...member, id: Math.random().toString(36).substr(2, 9) },
                  ],
                }
              }
              return part
            }),
          }
        }
        return p
      }),
    })),
  removePartnerTeamMember: (projectId, partnerId, memberId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) => {
              if (part.id === partnerId) {
                return {
                  ...part,
                  team: (part.team || []).filter((m) => m.id !== memberId),
                }
              }
              return part
            }),
          }
        }
        return p
      }),
    })),
  reallocateTasks: (projectId, oldMemberId, newMemberId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: p.stages.map((stage) => ({
              ...stage,
              subStages: stage.subStages.map((sub) => {
                if (sub.assignedTeamMemberId === oldMemberId) {
                  return {
                    ...sub,
                    assignedTeamMemberId: newMemberId,
                  }
                }
                return sub
              }),
            })),
          }
        }
        return p
      }),
    })),
  getProject: (id) => get().projects.find((p) => p.id === id),
  generateInvoice: (projectId, stageId, subStageId, type) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: (s.subStages || []).map((sub) => {
                    if (sub.id === subStageId) {
                      return {
                        ...sub,
                        invoiceStatus:
                          type === 'team_to_partner'
                            ? 'sent_to_partner'
                            : 'sent_to_contractor',
                      }
                    }
                    return sub
                  }),
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  rateTeamMember: (projectId, stageId, subStageId, rating) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: (s.subStages || []).map((sub) => {
                    if (sub.id === subStageId) {
                      return {
                        ...sub,
                        partnerRating: rating,
                      }
                    }
                    return sub
                  }),
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  addBudgetItem: (projectId, item) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            budgetItems: [
              ...(p.budgetItems || []),
              { ...item, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
  removeBudgetItem: (projectId, itemId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            budgetItems: (p.budgetItems || []).filter((i) => i.id !== itemId),
          }
        }
        return p
      }),
    })),
  updateApprovalStatus: (projectId, approvalId, status, user) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            approvalLogs: (p.approvalLogs || []).map((log) => {
              if (log.id === approvalId) {
                return {
                  ...log,
                  status,
                  history: [
                    ...log.history,
                    {
                      date: new Date(),
                      status,
                      user,
                    },
                  ],
                }
              }
              return log
            }),
          }
        }
        return p
      }),
    })),
  toggleIntegration: (projectId, platform) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const exists = p.integrations?.find((i) => i.platform === platform)
          if (exists) {
            return {
              ...p,
              integrations: p.integrations.map((i) =>
                i.platform === platform
                  ? {
                      ...i,
                      connected: !i.connected,
                      lastSync: !i.connected ? new Date() : i.lastSync,
                    }
                  : i,
              ),
            }
          }
          return {
            ...p,
            integrations: [
              ...(p.integrations || []),
              { platform, connected: true, lastSync: new Date() },
            ],
          }
        }
        return p
      }),
    })),
  addAllocatedCost: (projectId, cost) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newAllocatedCosts = [
            ...(p.allocatedCosts || []),
            { ...cost, id: Math.random().toString(36).substr(2, 9) },
          ]
          const totalAllocated = newAllocatedCosts.reduce(
            (acc, c) => acc + c.amount,
            0,
          )
          const stagesSpent = (p.stages || []).reduce(
            (acc, s) => acc + s.actualMaterial + s.actualLabor,
            0,
          )
          return {
            ...p,
            allocatedCosts: newAllocatedCosts,
            totalSpent: stagesSpent + totalAllocated,
          }
        }
        return p
      }),
    })),
  setProjectSqFt: (projectId, sqFt) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, sqFt } : p,
      ),
    })),
  applyTemplate: (projectId, items) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, constructionItems: items } : p,
      ),
    })),
  addConstructionItem: (projectId, item) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              constructionItems: [
                ...(p.constructionItems || []),
                { ...item, id: Math.random().toString(36).substr(2, 9) },
              ],
            }
          : p,
      ),
    })),
  updateConstructionItem: (projectId, itemId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newItems = (p.constructionItems || []).map((item) =>
            item.id === itemId ? { ...item, ...data } : item,
          )
          return { ...p, constructionItems: newItems }
        }
        return p
      }),
    })),
  removeConstructionItem: (projectId, itemId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              constructionItems: (p.constructionItems || []).filter(
                (i) => i.id !== itemId,
              ),
            }
          : p,
      ),
    })),
  addLaborAdjustment: (projectId, adjustment) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            laborAdjustments: [
              ...(p.laborAdjustments || []),
              { ...adjustment, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
}))
