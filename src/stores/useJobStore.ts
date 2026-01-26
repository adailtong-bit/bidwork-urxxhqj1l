import { create } from 'zustand'

export interface Bid {
  id: string
  jobId: string
  executorId: string
  executorName: string
  amount: number
  description: string
  createdAt: Date
  executorReputation: number
}

export interface Job {
  id: string
  ownerId: string
  ownerName: string
  title: string
  description: string
  type: 'fixed' | 'auction'
  status:
    | 'open'
    | 'suspended'
    | 'in_progress'
    | 'completed'
    | 'dispute'
    | 'cancelled'
  category: string
  location: string // e.g. "São Paulo, SP"
  regionCode: string // e.g. "SP", "RJ"
  budget: number
  bids: Bid[]
  acceptedBidId?: string
  createdAt: Date
  publicationDate: Date
  auctionEndDate?: Date
  maxExecutionDeadline?: Date
  premiumType: 'none' | 'region' | 'category'
  smartMatchScore?: number // Mocked AI score
}

interface JobState {
  jobs: Job[]
  addJob: (
    job: Omit<Job, 'id' | 'createdAt' | 'bids' | 'status' | 'smartMatchScore'>,
  ) => void
  addBid: (jobId: string, bid: Omit<Bid, 'id' | 'createdAt'>) => void
  acceptBid: (jobId: string, bidId: string) => void
  completeJob: (jobId: string) => void
  openDispute: (jobId: string) => void
  cancelJob: (jobId: string) => void
  getJob: (id: string) => Job | undefined
  hasActiveJob: (userId: string) => boolean
}

// Seed Data Configuration
const baseDate = new Date()

const createMockJob = (
  id: string,
  title: string,
  type: 'fixed' | 'auction',
  status: Job['status'],
  region: string,
  category: string,
  budget: number,
  offsetDays: number = 0,
): Job => ({
  id,
  ownerId: `owner-${id}`,
  ownerName: `Cliente ${region}`,
  title,
  description: `Descrição detalhada para o serviço de ${title} na região de ${region}. Necessário experiência e ferramentas próprias.`,
  type,
  status,
  category,
  location: `${region} Capital, ${region}`,
  regionCode: region,
  budget,
  bids: [],
  createdAt: new Date(baseDate.getTime() - offsetDays * 86400000),
  publicationDate: new Date(baseDate.getTime() - offsetDays * 86400000),
  auctionEndDate:
    type === 'auction'
      ? new Date(baseDate.getTime() + 86400000 * 5)
      : undefined,
  premiumType: Math.random() > 0.7 ? 'region' : 'none',
  smartMatchScore: Math.floor(Math.random() * 30) + 70, // 70-100 score
})

const mockJobs: Job[] = [
  // 3 Active Auctions
  createMockJob(
    '1',
    'Desenvolvimento App React Native',
    'auction',
    'open',
    'SP',
    'TI e Programação',
    5000,
    2,
  ),
  createMockJob(
    '2',
    'Reforma Completa Cozinha',
    'auction',
    'open',
    'RJ',
    'Reformas',
    8500,
    1,
  ),
  createMockJob(
    '3',
    'Marketing Digital Campanha Q4',
    'auction',
    'open',
    'MG',
    'Marketing',
    3000,
    3,
  ),

  // 2 Active Fixed
  createMockJob(
    '4',
    'Instalação Elétrica Residencial',
    'fixed',
    'open',
    'SP',
    'Serviços Gerais',
    450,
    5,
  ),
  createMockJob(
    '5',
    'Design de Logo e Identidade',
    'fixed',
    'open',
    'SC',
    'Design',
    1200,
    4,
  ),

  // 5 Historical (Completed)
  createMockJob(
    '6',
    'Consultoria Financeira PJ',
    'fixed',
    'completed',
    'SP',
    'Financeiro',
    2000,
    30,
  ),
  createMockJob(
    '7',
    'Limpeza Pós-Obra',
    'auction',
    'completed',
    'RJ',
    'Limpeza',
    800,
    45,
  ),
  createMockJob(
    '8',
    'Criação de Site E-commerce',
    'auction',
    'completed',
    'MG',
    'TI e Programação',
    6000,
    60,
  ),
  createMockJob(
    '9',
    'Manutenção Ar Condicionado',
    'fixed',
    'completed',
    'RS',
    'Serviços Gerais',
    300,
    20,
  ),
  createMockJob(
    '10',
    'Fotografia de Evento Corporativo',
    'fixed',
    'completed',
    'BA',
    'Design',
    1500,
    15,
  ),
]

export const useJobStore = create<JobState>((set, get) => ({
  jobs: mockJobs,
  addJob: (jobData) =>
    set((state) => ({
      jobs: [
        {
          ...jobData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          status: 'open',
          bids: [],
          regionCode: jobData.location.split(' ').pop() || 'SP', // Simple mock extraction
          smartMatchScore: 100, // New jobs get boost
        },
        ...state.jobs,
      ],
    })),
  addBid: (jobId, bidData) =>
    set((state) => ({
      jobs: state.jobs.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            bids: [
              ...job.bids,
              {
                ...bidData,
                id: Math.random().toString(36).substr(2, 9),
                jobId,
                createdAt: new Date(),
              },
            ],
          }
        }
        return job
      }),
    })),
  acceptBid: (jobId, bidId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: 'suspended',
              acceptedBidId: bidId,
            }
          : job,
      ),
    })),
  completeJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, status: 'completed' } : job,
      ),
    })),
  openDispute: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, status: 'dispute' } : job,
      ),
    })),
  cancelJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, status: 'cancelled' } : job,
      ),
    })),
  getJob: (id) => get().jobs.find((j) => j.id === id),
  hasActiveJob: (userId) => {
    return get().jobs.some(
      (j) =>
        j.ownerId === userId && !['completed', 'cancelled'].includes(j.status),
    )
  },
}))
