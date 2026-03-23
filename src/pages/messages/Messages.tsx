import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Send, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMessageStore } from '@/stores/useMessageStore'

export default function Messages() {
  const { t, getDateLocale } = useLanguageStore()
  const { user } = useAuthStore()
  const { conversations, sendMessage } = useMessageStore()
  const [searchParams] = useSearchParams()

  const convParam = searchParams.get('conv')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(convParam)
  const [messageInput, setMessageInput] = useState('')

  useEffect(() => {
    if (convParam) setSelectedConversationId(convParam)
  }, [convParam])

  if (!user) return null

  const myConversations = conversations.filter((c) =>
    c.participants.some((p) => p.id === user.id),
  )

  const selectedConversation = myConversations.find(
    (c) => c.id === selectedConversationId,
  )

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return
    sendMessage(selectedConversationId, user.id, messageInput)
    setMessageInput('')
  }

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: getDateLocale(),
    })
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
            placeholder={t('messages.search')}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {myConversations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {t('messages.no_messages')}
            </div>
          ) : (
            myConversations
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
                      <div className="relative">
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
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessageText}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
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
              <div>
                <h3 className="font-semibold">
                  {
                    selectedConversation.participants.find(
                      (p) => p.id !== user.id,
                    )?.name
                  }
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
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.senderId === user.id
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
