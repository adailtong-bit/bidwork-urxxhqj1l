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
  projectId?: string // Linked Project ID
  stageId?: string // Linked Stage ID
  title: string
  description: string
  photos: string[]
  type: 'fixed' | 'auction'
  status:
    | 'open'
    | 'suspended'
    | 'in_progress'
    | 'completed'
    | 'dispute'
    | 'cancelled'
  category: string
  location: string
  regionCode: string
  budget: number
  bids: Bid[]
  acceptedBidId?: string
  createdAt: Date
  publicationDate: Date
  auctionEndDate?: Date
  maxExecutionDeadline?: Date
  premiumType: 'none' | 'region' | 'category'
  smartMatchScore?: number
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
  getJobsByProject: (projectId: string) => Job[]
  hasActiveJob: (userId: string) => boolean
}

const baseDate = new Date()

const createMockJob = (
  id: string,
  title: string,
  type: 'fixed' | 'auction',
  status: Job['status'],
  region: string,
  category: string,
  budget: number,
  photos: string[] = [],
  offsetDays: number = 0,
): Job => ({
  id,
  ownerId: `owner-${id}`,
  ownerName: `Cliente ${region}`,
  title,
  description: `Descrição detalhada para o serviço de ${title} na região de ${region}.`,
  photos,
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
  smartMatchScore: Math.floor(Math.random() * 30) + 70,
})

const mockJobs: Job[] = [
  createMockJob(
    '1',
    'Desenvolvimento App React Native',
    'auction',
    'open',
    'SP',
    'TI e Programação',
    5000,
    [
      'https://img.usecurling.com/p/400/300?q=code',
      'https://img.usecurling.com/p/400/300?q=app',
    ],
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
    ['https://img.usecurling.com/p/400/300?q=kitchen'],
    1,
  ),
  {
    ...createMockJob(
      '3',
      'Terraplanagem Residencial Alpha',
      'auction',
      'in_progress',
      'SP',
      'Reformas',
      25000,
      [],
      10,
    ),
    ownerId: 'owner-1', // Match test user
    projectId: 'proj-1',
    stageId: 'st-1',
    bids: [
      {
        id: 'bid-1',
        jobId: '3',
        executorId: 'exec-1',
        executorName: 'Terraplanagem Silva',
        amount: 24000,
        description: 'Equipe completa com retroescavadeira.',
        createdAt: new Date(),
        executorReputation: 4.8,
      },
    ],
    acceptedBidId: 'bid-1',
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
          regionCode: jobData.location.split(' ').pop() || 'SP',
          smartMatchScore: 100,
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
  getJobsByProject: (projectId) =>
    get().jobs.filter((j) => j.projectId === projectId),
  hasActiveJob: (userId) => {
    return get().jobs.some(
      (j) =>
        j.ownerId === userId && !['completed', 'cancelled'].includes(j.status),
    )
  },
}))
