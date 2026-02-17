import { useState } from 'react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Send, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/stores/useAuthStore'

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  partnerName: string
  partnerAvatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    partnerName: 'Ana Silva',
    partnerAvatar:
      'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    lastMessage: 'Podemos agendar a visita para amanhã?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'partner',
        content: 'Olá, vi seu anúncio de reforma.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        id: 'm2',
        senderId: 'me',
        content: 'Olá Ana! Claro, quando você tem disponibilidade?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
      },
      {
        id: 'm3',
        senderId: 'partner',
        content: 'Podemos agendar a visita para amanhã?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
  },
  {
    id: '2',
    partnerName: 'Carlos Tech',
    partnerAvatar:
      'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    lastMessage: 'Projeto finalizado, aguardando aprovação.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    unreadCount: 0,
    messages: [],
  },
]

export default function Messages() {
  const { t, getDateLocale } = useLanguageStore()
  const { user } = useAuthStore()
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [messageInput, setMessageInput] = useState('')
  const [conversations, setConversations] = useState(mockConversations)

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  )

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      content: messageInput,
      timestamp: new Date(),
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConversationId) {
          return {
            ...c,
            lastMessage: messageInput,
            lastMessageTime: new Date(),
            messages: [...c.messages, newMessage],
          }
        }
        return c
      }),
    )
    setMessageInput('')
  }

  // Helper to format date strictly with locale
  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: getDateLocale(),
    })
  }

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 pb-20 md:pb-0">
      {/* Conversation List */}
      <div
        className={`${selectedConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col gap-4`}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('messages.title')}
          </h1>
          <p className="text-muted-foreground">{t('messages.desc')}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('messages.search')}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {t('messages.no_messages')}
            </div>
          ) : (
            conversations.map((conv) => (
              <Card
                key={conv.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversationId === conv.id
                    ? 'bg-muted border-primary'
                    : ''
                }`}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conv.partnerAvatar} />
                      <AvatarFallback>{conv.partnerName[0]}</AvatarFallback>
                    </Avatar>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold truncate">
                        {conv.partnerName}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div
        className={`${!selectedConversationId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-card rounded-lg border shadow-sm h-full`}
      >
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversationId(null)}
              >
                <Search className="h-4 w-4" />{' '}
                {/* Use generic back icon if needed */}
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.partnerAvatar} />
                <AvatarFallback>
                  {selectedConversation.partnerName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.partnerName}
                </h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Online
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.senderId === 'me'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1 text-right">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-background rounded-b-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('messages.type_placeholder')}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="bg-muted p-6 rounded-full mb-4">
              <MessageSquare className="h-12 w-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('messages.title')}
            </h3>
            <p>{t('messages.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
