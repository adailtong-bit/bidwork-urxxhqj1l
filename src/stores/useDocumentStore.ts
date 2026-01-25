import { create } from 'zustand'

export interface Document {
  id: string
  name: string
  size: number
  type: string
  url?: string
  createdAt: Date
  status: 'uploading' | 'completed' | 'error'
}

interface DocumentState {
  documents: Document[]
  addDocument: (document: Document) => void
  deleteDocument: (id: string) => void
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Especificações_Projeto_v2.pdf',
    size: 2450000, // 2.45 MB
    type: 'application/pdf',
    createdAt: new Date('2024-01-20T10:30:00'),
    status: 'completed',
  },
  {
    id: '2',
    name: 'Logo_Principal.png',
    size: 540000, // 540 KB
    type: 'image/png',
    createdAt: new Date('2024-01-22T14:15:00'),
    status: 'completed',
  },
  {
    id: '3',
    name: 'Planilha_Orcamento_Q1.xlsx',
    size: 120000, // 120 KB
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    createdAt: new Date('2024-01-24T09:00:00'),
    status: 'completed',
  },
]

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: mockDocuments,
  addDocument: (document) =>
    set((state) => ({
      documents: [document, ...state.documents],
    })),
  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),
}))
