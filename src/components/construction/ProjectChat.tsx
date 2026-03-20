import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, User as UserIcon, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface ProjectChatProps {
  open: boolean
  onClose: () => void
  projectId: string
}

export function ProjectChat({ open, onClose, projectId }: ProjectChatProps) {
  const { getProject, addProjectMessage } = useProjectStore()
  const { user } = useAuthStore()
  const { formatDate } = useLanguageStore()
  const project = getProject(projectId)

  const [filter, setFilter] = useState<'internal' | 'external'>('internal')
  const [msg, setMsg] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [project?.messages, filter])

  if (!project) return null

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!msg.trim()) return

    addProjectMessage(projectId, {
      senderId: user?.id || 'sys',
      senderName: user?.name || 'Eu',
      text: msg,
      type: filter,
    })
    setMsg('')
  }

  const filteredMessages = (project.messages || []).filter(
    (m) => m.type === filter,
  )

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-4 sm:p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Hub de Comunicação
          </SheetTitle>
        </SheetHeader>

        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as any)}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="internal">Equipe Interna</TabsTrigger>
            <TabsTrigger value="external">Parceiros Externos</TabsTrigger>
          </TabsList>

          <TabsContent
            value={filter}
            className="flex-1 flex flex-col h-full m-0 p-0 border rounded-lg bg-muted/10 overflow-hidden"
          >
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground mt-10 text-sm">
                    Nenhuma mensagem nesta conversa.
                  </div>
                ) : (
                  filteredMessages.map((m) => {
                    const isMe = m.senderId === user?.id
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {m.senderName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-muted-foreground mb-1 px-1">
                            {m.senderName} • {formatDate(m.timestamp, 'HH:mm')}
                          </span>
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              isMe
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-card border shadow-sm rounded-tl-none'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSend} className="mt-4 flex gap-2 shrink-0">
          <Input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={`Mensagem para ${filter === 'internal' ? 'Equipe' : 'Parceiros'}...`}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
