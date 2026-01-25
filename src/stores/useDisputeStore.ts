import { create } from 'zustand'

export interface DisputeEvidence {
  description: string
  files: File[]
  submittedBy: string
  createdAt: Date
}

export interface Dispute {
  id: string
  jobId: string
  openerId: string
  status: 'open' | 'mediation' | 'resolved'
  evidences: DisputeEvidence[]
  createdAt: Date
}

interface DisputeState {
  disputes: Dispute[]
  createDispute: (
    jobId: string,
    openerId: string,
    description: string,
    files: File[],
  ) => void
  addEvidence: (disputeId: string, evidence: DisputeEvidence) => void
}

export const useDisputeStore = create<DisputeState>((set) => ({
  disputes: [],
  createDispute: (jobId, openerId, description, files) =>
    set((state) => ({
      disputes: [
        ...state.disputes,
        {
          id: Math.random().toString(36).substr(2, 9),
          jobId,
          openerId,
          status: 'open',
          createdAt: new Date(),
          evidences: [
            {
              description,
              files,
              submittedBy: openerId,
              createdAt: new Date(),
            },
          ],
        },
      ],
    })),
  addEvidence: (disputeId, evidence) =>
    set((state) => ({
      disputes: state.disputes.map((d) =>
        d.id === disputeId
          ? { ...d, evidences: [...d.evidences, evidence] }
          : d,
      ),
    })),
}))
