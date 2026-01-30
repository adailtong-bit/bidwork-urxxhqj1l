import { create } from 'zustand'

export type DocumentType =
  | 'Permit'
  | 'Insurance'
  | 'License'
  | 'Water'
  | 'Electric'
  | 'Sewage'

export interface ConstructionDocument {
  id: string
  projectId: string
  type: DocumentType
  name: string
  requestDate: Date
  approvalDate?: Date
  validity?: Date
  partnerId?: string // Linked partner
  status: 'Pending' | 'Approved' | 'Expired' | 'Rejected'
  url?: string
}

interface ConstructionDocumentState {
  documents: ConstructionDocument[]
  addDocument: (doc: Omit<ConstructionDocument, 'id'>) => void
  updateDocument: (id: string, data: Partial<ConstructionDocument>) => void
  deleteDocument: (id: string) => void
  getDocumentsByProject: (projectId: string) => ConstructionDocument[]
}

const mockDocuments: ConstructionDocument[] = [
  {
    id: 'doc-1',
    projectId: 'proj-1',
    type: 'Permit',
    name: 'Alvará de Construção',
    requestDate: new Date('2023-01-10'),
    approvalDate: new Date('2023-01-25'),
    validity: new Date('2025-01-25'),
    status: 'Approved',
  },
  {
    id: 'doc-2',
    projectId: 'proj-1',
    type: 'Insurance',
    name: 'Seguro de Obra Civil',
    requestDate: new Date('2023-02-01'),
    approvalDate: new Date('2023-02-05'),
    validity: new Date('2024-02-05'), // Expired
    status: 'Expired',
  },
]

export const useConstructionDocumentStore = create<ConstructionDocumentState>(
  (set, get) => ({
    documents: mockDocuments,
    addDocument: (doc) =>
      set((state) => ({
        documents: [
          ...state.documents,
          { ...doc, id: Math.random().toString(36).substr(2, 9) },
        ],
      })),
    updateDocument: (id, data) =>
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, ...data } : d,
        ),
      })),
    deleteDocument: (id) =>
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      })),
    getDocumentsByProject: (projectId) =>
      get().documents.filter((d) => d.projectId === projectId),
  }),
)
