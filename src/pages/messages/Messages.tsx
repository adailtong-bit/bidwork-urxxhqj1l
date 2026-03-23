import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Send, MessageSquare, Lock, Unlock, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMessageStore } from '@/stores/useMessageStore'
import { useToast } from '@/hooks/use-toast'

const MOCK_PLATFORM_USERS = [
  {
    id: 'owner-1',
    name: 'Admin Tech Corp',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=owner-1',
    openChat: true,
  },
  {
    id: 'exec-1',
    name: 'João Freelancer',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-1',
    openChat: false,
  },
  {
    id: 'exec-pj-1',
    name: 'Soluções Rápidas Ltda',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-pj-1',
    openChat: true,
  },
  {
    id: 'u-4',
    name: 'Maria Silva',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=maria',
    openChat: false,
  },
  {
    id: 'u-5',
    name: 'Carlos Santos',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=carlos',
    openChat: true,
  },
  {
    id: 'admin-1',
    name: 'Administrador do Sistema',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=admin',
    openChat: true,
  },
]

export default function Messages() {
  const { t, getDateLocale } = useLanguageStore()
  const { user } = useAuthStore()
  const { conversations, sendMessage, getOrCreateConversation } =
    useMessageStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const convParam = searchParams.get('conv')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(convParam)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (convParam) setSelectedConversationId(convParam)
  }, [convParam])

  if (!user) return null

  const myConversations = conversations.filter((c) =>
    c.participants.some((p) => p.id === user.id),
  )

  const filteredConversations = myConversations.filter((conv) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const partner =
      conv.participants.find((p) => p.id !== user.id) || conv.participants[0]
    const matchName = partner.name.toLowerCase().includes(q)
    const matchContext = conv.context?.title.toLowerCase().includes(q)
    const matchMessage = conv.messages.some((m) =>
      m.content.toLowerCase().includes(q),
    )
    return matchName || matchMessage || matchContext
  })

  const searchedUsers = searchQuery.trim()
    ? MOCK_PLATFORM_USERS.filter((u) => {
        if (u.id === user.id) return false
        const inConv = myConversations.some((c) =>
          c.participants.some((p) => p.id === u.id),
        )
        if (inConv) return false
        return u.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : []

  const selectedConversation = myConversations.find(
    (c) => c.id === selectedConversationId,
  )

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return
    sendMessage(selectedConversationId, user.id, messageInput)
    setMessageInput('')
  }

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return ''
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: getDateLocale(),
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 pb-20 md:pb-0 pt-4">
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
            placeholder="Buscar mensagens ou pessoas"
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {filteredConversations.length > 0 && (
            <div className="space-y-2">
              {searchQuery && (
                <h3 className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                  Conversas
                </h3>
              )}
              {filteredConversations
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
                )
                .map((conv) => {
                  const partner =
                    conv.participants.find((p) => p.id !== user.id) ||
                    conv.participants[0]
                  const lastMessage = conv.messages[conv.messages.length - 1]
                  const lastMessageText = lastMessage
                    ? lastMessage.content
                    : 'Nova conversa iniciada'
                  const lastMessageTime = lastMessage
                    ? lastMessage.timestamp
                    : conv.updatedAt

                  return (
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
                        <div className="relative shrink-0">
                          <Avatar>
                            <AvatarImage src={partner.avatar} />
                            <AvatarFallback>
                              {partner.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold truncate">
                              {partner.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                              {formatTimeAgo(lastMessageTime)}
                            </span>
                          </div>
                          {conv.context && (
                            <p className="text-[11px] text-primary/80 truncate font-medium mt-0.5 mb-0.5">
                              Ref: {conv.context.title}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessageText}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}

          {searchQuery.trim() && searchedUsers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                Pessoas (Diretório)
              </h3>
              {searchedUsers.map((u) => {
                const canMessage = user.isPremium || u.openChat
                return (
                  <Card
                    key={u.id}
                    className={`cursor-pointer transition-all ${
                      canMessage
                        ? 'hover:bg-muted/50 border-border'
                        : 'opacity-75 bg-muted/20 border-dashed'
                    }`}
                    onClick={() => {
                      if (!canMessage) {
                        toast({
                          title: 'Acesso Restrito',
                          description:
                            'Assine o Premium para enviar mensagens a usuários com chat fechado.',
                        })
                        return
                      }
                      const convId = getOrCreateConversation(
                        {
                          id: user.id,
                          name: user.name,
                          avatar: user.avatar || '',
                        },
                        { id: u.id, name: u.name, avatar: u.avatar },
                      )
                      setSelectedConversationId(convId)
                      setSearchQuery('')
                    }}
                  >
                    <CardContent className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm truncate">
                            {u.name}
                          </span>
                          {canMessage ? (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {u.openChat ? (
                                <Unlock className="h-3 w-3" />
                              ) : (
                                <Star className="h-3 w-3" />
                              )}
                              {u.openChat ? 'Chat Aberto' : 'Acesso Premium'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-destructive flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Chat Fechado
                            </span>
                          )}
                        </div>
                      </div>
                      {!canMessage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          asChild
                        >
                          <Link to="/subscription">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {searchQuery.trim() &&
            searchedUsers.length === 0 &&
            filteredConversations.length === 0 && (
              <div className="text-center py-10 px-4 text-muted-foreground border border-dashed rounded-lg mt-4">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  Nenhum resultado encontrado.
                </p>
                {!user.isPremium && (
                  <div className="mt-3">
                    <p className="text-xs mb-3">
                      Usuários com perfil privado podem não aparecer. O plano
                      Premium oferece prospecção ativa e visão expandida.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/subscription')}
                    >
                      <Star className="h-3 w-3 mr-2 text-amber-500 fill-amber-500" />
                      Ver Planos
                    </Button>
                  </div>
                )}
              </div>
            )}

          {!searchQuery.trim() && filteredConversations.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              {t('messages.no_messages')}
            </div>
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
                <Search className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    selectedConversation.participants.find(
                      (p) => p.id !== user.id,
                    )?.avatar
                  }
                />
                <AvatarFallback>
                  {selectedConversation.participants
                    .find((p) => p.id !== user.id)
                    ?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {
                    selectedConversation.participants.find(
                      (p) => p.id !== user.id,
                    )?.name
                  }
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  {selectedConversation.context && (
                    <span className="text-primary font-medium truncate max-w-[150px] md:max-w-[300px]">
                      Ref: {selectedConversation.context.title}
                    </span>
                  )}
                  <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.senderId === user.id
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1 text-right">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              {selectedConversation.messages.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Envie a primeira mensagem para iniciar a conversa.
                </div>
              )}
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
