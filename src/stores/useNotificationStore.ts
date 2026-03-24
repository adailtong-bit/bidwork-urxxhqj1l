import { create } from 'zustand'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  link?: string
  referenceId?: string
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
  ) => void
  upsertNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: (userId: string) => void
  clearAll: (userId: string) => void
  getUnreadCount: (userId: string) => number
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      userId: 'owner-1', // Mock user ID matches Job owner
      title: 'Bem-vindo ao BIDWORK',
      message: 'Complete seu perfil para ter mais visibilidade.',
      type: 'info',
      read: false,
      createdAt: new Date(),
    },
  ],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          read: false,
        },
        ...state.notifications,
      ],
    })),
  upsertNotification: (notification) =>
    set((state) => {
      const exists = notification.referenceId
        ? state.notifications.find(
            (n) => n.referenceId === notification.referenceId,
          )
        : false

      if (exists) {
        return state // Do not duplicate if it already exists
      }

      return {
        notifications: [
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            read: false,
          },
          ...state.notifications,
        ],
      }
    }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
  markAllAsRead: (userId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n,
      ),
    })),
  clearAll: (userId) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.userId !== userId),
    })),
  getUnreadCount: (userId) => {
    return get().notifications.filter((n) => n.userId === userId && !n.read)
      .length
  },
}))
