import { create } from 'zustand'

export interface Transaction {
  id: string
  jobId: string
  jobTitle: string
  payerId: string
  payerName: string
  receiverId: string
  receiverName: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'escrow'
  date: Date
  type: 'payment' | 'receipt'
}

interface PaymentState {
  transactions: Transaction[]
  processPayment: (
    jobId: string,
    jobTitle: string,
    amount: number,
    payer: { id: string; name: string },
    receiver: { id: string; name: string },
  ) => Promise<boolean>
  getTransactionsByUser: (userId: string) => Transaction[]
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  transactions: [
    {
      id: 'tx-seed-1',
      jobId: 'job-seed-1',
      jobTitle: 'Desenvolvimento Web Site',
      payerId: 'owner-1',
      payerName: 'Cliente Seed',
      receiverId: 'executor-1',
      receiverName: 'Dev Seed',
      amount: 1500,
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 5),
      type: 'payment', // Depending on perspective, but assuming single ledger for now
    },
  ],
  processPayment: async (jobId, jobTitle, amount, payer, receiver) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      jobTitle,
      payerId: payer.id,
      payerName: payer.name,
      receiverId: receiver.id,
      receiverName: receiver.name,
      amount,
      status: 'escrow', // Initially in escrow for marketplace safety
      date: new Date(),
      type: 'payment',
    }

    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }))

    return true
  },
  getTransactionsByUser: (userId) => {
    const { transactions } = get()
    // Filter transactions where user is payer or receiver
    return transactions.filter(
      (t) => t.payerId === userId || t.receiverId === userId,
    )
  },
}))
