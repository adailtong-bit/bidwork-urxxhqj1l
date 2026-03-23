import { create } from 'zustand'

export interface ConversationContext {
  type: 'job' | 'profile' | 'general'
  id: string
  title: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
}

export interface ConversationParticipant {
  id: string
  name: string
  avatar: string
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  messages: Message[]
  updatedAt: Date
  context?: ConversationContext
}

export interface Interest {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  targetId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
  context?: ConversationContext
}

interface MessageState {
  conversations: Conversation[]
  interests: Interest[]
  sendInterest: (
    sender: { id: string; name: string; avatar?: string },
    targetId: string,
    context?: ConversationContext,
  ) => void
  acceptInterest: (interestId: string) => void
  declineInterest: (interestId: string) => void
  sendMessage: (
    conversationId: string,
    senderId: string,
    content: string,
  ) => void
  getOrCreateConversation: (
    userA: ConversationParticipant,
    userB: ConversationParticipant,
    context?: ConversationContext,
  ) => string
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  interests: [
    {
      id: 'mock-int-1',
      senderId: 'mock-sender-1',
      senderName: 'Carlos Interessado',
      senderAvatar: 'https://img.usecurling.com/ppl/thumbnail?seed=carlos',
      targetId: 'owner-1', // Admin Tech Corp mock ID
      status: 'pending',
      createdAt: new Date(),
    },
  ],
  sendInterest: (sender, targetId, context) =>
    set((state) => ({
      interests: [
        ...state.interests,
        {
          id: Math.random().toString(36).substr(2, 9),
          senderId: sender.id,
          senderName: sender.name,
          senderAvatar: sender.avatar || '',
          targetId,
          status: 'pending',
          createdAt: new Date(),
          context,
        },
      ],
    })),
  acceptInterest: (id) =>
    set((state) => {
      const interest = state.interests.find((i) => i.id === id)
      if (!interest) return state

      const newConvId = Math.random().toString(36).substr(2, 9)
      const newConv: Conversation = {
        id: newConvId,
        participants: [
          {
            id: interest.senderId,
            name: interest.senderName,
            avatar: interest.senderAvatar,
          },
          {
            id: interest.targetId,
            name: 'Você',
            avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${interest.targetId}`,
          },
        ],
        messages: [],
        updatedAt: new Date(),
        context: interest.context,
      }

      return {
        interests: state.interests.map((i) =>
          i.id === id ? { ...i, status: 'accepted' } : i,
        ),
        conversations: [newConv, ...state.conversations],
      }
    }),
  declineInterest: (id) =>
    set((state) => ({
      interests: state.interests.map((i) =>
        i.id === id ? { ...i, status: 'declined' } : i,
      ),
    })),
  sendMessage: (convId, senderId, content) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  senderId,
                  content,
                  timestamp: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          : c,
      ),
    })),
  getOrCreateConversation: (userA, userB, context) => {
    const state = get()
    const existing = state.conversations.find(
      (c) =>
        c.participants.some((p) => p.id === userA.id) &&
        c.participants.some((p) => p.id === userB.id) &&
        (context ? c.context?.id === context.id : true),
    )
    if (existing) return existing.id

    const newConvId = Math.random().toString(36).substr(2, 9)
    set((s) => ({
      conversations: [
        {
          id: newConvId,
          participants: [userA, userB],
          messages: [],
          updatedAt: new Date(),
          context,
        },
        ...s.conversations,
      ],
    }))
    return newConvId
  },
}))
