import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'
import React from 'react'
import { toast } from '@/hooks/use-toast'

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
  negotiationStatus?: 'analysis' | 'proposal' | 'contracted'
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
  acceptInterest: (interestId: string) => string | undefined
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
    negotiationStatus?: 'analysis' | 'proposal' | 'contracted',
  ) => string
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [
    {
      id: 'mock-conv-1',
      participants: [
        {
          id: 'owner-1',
          name: 'Admin Tech Corp',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=owner-1',
        },
        {
          id: 'exec-1',
          name: 'João Freelancer',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-1',
        },
      ],
      messages: [
        {
          id: 'm1',
          senderId: 'exec-1',
          content:
            'Olá, vi sua vaga para Desenvolvedor Backend. Tenho interesse!',
          timestamp: new Date(Date.now() - 3600000),
        },
      ],
      updatedAt: new Date(Date.now() - 3600000),
      negotiationStatus: 'analysis',
      context: {
        type: 'job',
        id: 'job-1',
        title: 'Reforma Completa de Fachada (Novo & Premium)',
      },
    },
    {
      id: 'mock-conv-2',
      participants: [
        {
          id: 'owner-2',
          name: 'Startup Alpha',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=owner-2',
        },
        {
          id: 'exec-pj-1',
          name: 'Soluções Rápidas Ltda',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-pj-1',
        },
      ],
      messages: [
        {
          id: 'm2',
          senderId: 'exec-pj-1',
          content: 'Segue a proposta comercial para o projeto.',
          timestamp: new Date(Date.now() - 86400000),
        },
      ],
      updatedAt: new Date(Date.now() - 86400000),
      negotiationStatus: 'proposal',
      context: {
        type: 'job',
        id: 'job-2',
        title: 'Desenvolvimento de Aplicativo',
      },
    },
    {
      id: 'mock-conv-3',
      participants: [
        {
          id: 'owner-1',
          name: 'Admin Tech Corp',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=owner-1',
        },
        {
          id: 'admin-1',
          name: 'Administrador do Sistema',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=admin',
        },
      ],
      messages: [
        {
          id: 'm3',
          senderId: 'admin-1',
          content: 'Bem-vindo à plataforma Bidwork!',
          timestamp: new Date(Date.now() - 86400000 * 5),
        },
        {
          id: 'm4',
          senderId: 'owner-1',
          content: 'Obrigado!',
          timestamp: new Date(Date.now() - 86400000 * 4),
        },
      ],
      updatedAt: new Date(Date.now() - 86400000 * 4),
      negotiationStatus: 'contracted',
    },
  ],
  interests: [
    {
      id: 'mock-int-1',
      senderId: 'exec-pj-1',
      senderName: 'Soluções Rápidas Ltda',
      senderAvatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-pj-1',
      targetId: 'owner-1', // Targets the Admin Tech Corp (Contractor)
      status: 'pending',
      createdAt: new Date(),
      context: {
        type: 'job',
        id: 'job-1',
        title: 'Reforma Completa de Fachada (Novo & Premium)',
      },
    },
    {
      id: 'mock-int-2',
      senderId: 'owner-2',
      senderName: 'Startup Alpha',
      senderAvatar: 'https://img.usecurling.com/ppl/thumbnail?seed=owner-2',
      targetId: 'exec-1', // Targets João Freelancer (Executor)
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000),
      context: {
        type: 'job',
        id: 'job-2',
        title: 'Desenvolvimento de Aplicativo',
      },
    },
  ],
  sendInterest: (sender, targetId, context) => {
    set((state) => ({
      interests: [
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
        ...state.interests,
      ],
    }))

    // Real-time Notification System Hook
    const authUser = useAuthStore.getState().user
    if (!authUser) return

    const isTargetCurrentUser = authUser.id === targetId

    // Only alert if the target is the current active user (e.g. simulated or multi-tab usage)
    if (isTargetCurrentUser) {
      const prefs = authUser.notificationPreferences || {
        emailInterests: true,
        pushInterests: false,
      }

      // Mock Email Notification
      if (prefs.emailInterests !== false) {
        toast({
          title: `📧 E-mail Automático -> ${authUser.email}`,
          description: React.createElement(
            'div',
            {
              className:
                'mt-2 space-y-2 p-3 bg-muted/50 rounded-md border border-border w-full',
            },
            React.createElement(
              'h4',
              { className: 'font-bold text-primary text-base' },
              'BIDWORK',
            ),
            React.createElement(
              'p',
              { className: 'text-sm text-foreground leading-snug' },
              'Novo Interesse: ',
              React.createElement('strong', null, sender.name),
              ' tem interesse em ',
              React.createElement(
                'strong',
                null,
                context?.title || 'seu perfil',
              ),
              '.',
            ),
            React.createElement(
              'a',
              {
                href: '/dashboard?tab=interests',
                className:
                  'inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 mt-2',
              },
              'Ver no BIDWORK',
            ),
          ),
          duration: 10000,
        })
      }

      // Web Push Notification
      if (
        prefs.pushInterests &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const title = `Novo Interesse: ${sender.name}`
        const options = {
          body: `${sender.name} tem interesse em ${context?.title || 'seu perfil'}.`,
          icon: '/favicon.ico',
        }
        const notif = new Notification(title, options)
        notif.onclick = () => {
          window.focus()
          window.location.href = '/dashboard?tab=interests'
        }
      }
    }
  },
  acceptInterest: (id) => {
    let newConvId: string | undefined

    set((state) => {
      const interest = state.interests.find((i) => i.id === id)
      if (!interest) return state

      newConvId = Math.random().toString(36).substr(2, 9)
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
        negotiationStatus: 'analysis',
      }

      return {
        interests: state.interests.map((i) =>
          i.id === id ? { ...i, status: 'accepted' } : i,
        ),
        conversations: [newConv, ...state.conversations],
      }
    })

    return newConvId
  },
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
  getOrCreateConversation: (userA, userB, context, negotiationStatus) => {
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
          negotiationStatus: negotiationStatus || 'analysis',
        },
        ...s.conversations,
      ],
    }))
    return newConvId
  },
}))
