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
    | 'suspended' // Agreement reached, waiting execution/completion
    | 'in_progress'
    | 'completed'
    | 'dispute'
    | 'cancelled'
  category: string
  location: string
  budget: number
  bids: Bid[]
  acceptedBidId?: string
  createdAt: Date
  publicationDate: Date
  auctionEndDate?: Date
  maxExecutionDeadline?: Date
  premiumType: 'none' | 'region' | 'category' // Visibility Tier
}

interface JobState {
  jobs: Job[]
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'bids' | 'status'>) => void
  addBid: (jobId: string, bid: Omit<Bid, 'id' | 'createdAt'>) => void
  acceptBid: (jobId: string, bidId: string) => void
  completeJob: (jobId: string) => void
  openDispute: (jobId: string) => void
  cancelJob: (jobId: string) => void
  getJob: (id: string) => Job | undefined
  hasActiveJob: (userId: string) => boolean
}

const mockJobs: Job[] = [
  {
    id: '1',
    ownerId: '1',
    ownerName: 'Maria Contratante',
    title: 'Desenvolvimento de Site Institucional',
    description: 'Preciso de um site Wordpress para minha clínica.',
    type: 'fixed',
    status: 'open',
    category: 'TI e Programação',
    location: 'São Paulo, SP',
    budget: 2500,
    bids: [
      {
        id: 'b1',
        jobId: '1',
        executorId: '99',
        executorName: 'Dev Expert',
        amount: 2500,
        description: 'Entrego em 10 dias.',
        createdAt: new Date(),
        executorReputation: 4.9,
      },
    ],
    createdAt: new Date(),
    publicationDate: new Date(),
    maxExecutionDeadline: new Date(Date.now() + 86400000 * 30),
    premiumType: 'category',
  },
  {
    id: '2',
    ownerId: '2',
    ownerName: 'Empresa ABC Ltda',
    title: 'Reforma de Escritório',
    description: 'Pintura e reparos elétricos em sala comercial de 50m2.',
    type: 'auction',
    status: 'open',
    category: 'Reformas',
    location: 'Rio de Janeiro, RJ',
    budget: 1500,
    bids: [],
    createdAt: new Date(Date.now() - 86400000),
    publicationDate: new Date(Date.now() - 86400000),
    auctionEndDate: new Date(Date.now() + 86400000 * 2),
    premiumType: 'none',
  },
  {
    id: '3',
    ownerId: '3',
    ownerName: 'Carlos Silva',
    title: 'Instalação de Ar Condicionado',
    description: 'Instalação de 2 unidades split.',
    type: 'fixed',
    status: 'open',
    category: 'Reformas',
    location: 'São Paulo, SP',
    budget: 800,
    bids: [],
    createdAt: new Date(Date.now() - 100000000),
    publicationDate: new Date(Date.now() - 100000000),
    premiumType: 'region',
  },
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
              status: 'suspended', // Hidden from public lists, waiting execution start
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
