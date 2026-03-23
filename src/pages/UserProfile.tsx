import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMessageStore } from '@/stores/useMessageStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Heart, Shield, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { conversations, interests, sendInterest, getOrCreateConversation } =
    useMessageStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Mock fetching user data for demonstration
  const targetUser = {
    id: id!,
    name:
      id === 'owner-1'
        ? 'Admin Tech Corp'
        : 'Profissional ' + id?.substring(0, 4),
    avatar: `https://img.usecurling.com/ppl/large?seed=${id}`,
    openChat: id === 'owner-1' ? true : false,
    role: id === 'owner-1' ? 'contractor' : 'executor',
    reputation: 4.8,
    location: 'São Paulo - SP',
  }

  if (!user)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Por favor, faça login para ver este perfil.
      </div>
    )

  if (user.id === id) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">Meu Perfil Público</h2>
        <p className="text-muted-foreground">
          Este é como outros usuários veem o seu perfil na plataforma.
        </p>
        <Button onClick={() => navigate('/settings')}>
          Ir para Configurações
        </Button>
      </div>
    )
  }

  const isPremium = user.isPremium

  const existingConversation = conversations.find(
    (c) =>
      c.participants.some((p) => p.id === user.id) &&
      c.participants.some((p) => p.id === id),
  )
  const existingInterest = interests.find(
    (i) => i.senderId === user.id && i.targetId === id,
  )

  const canMessage = targetUser.openChat || isPremium || !!existingConversation

  const handleAction = () => {
    if (canMessage) {
      const convId = getOrCreateConversation(
        { id: user.id, name: user.name, avatar: user.avatar || '' },
        {
          id: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
        },
      )
      navigate(`/messages?conv=${convId}`)
    } else {
      sendInterest(
        { id: user.id, name: user.name, avatar: user.avatar },
        targetUser.id,
      )
      toast({
        title: 'Interesse enviado!',
        description: 'Aguarde a aceitação do usuário para iniciar o chat.',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" className="mb-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-28 w-28 border-4 border-muted">
            <AvatarImage src={targetUser.avatar} />
            <AvatarFallback className="text-2xl">
              {targetUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left space-y-3">
            <h1 className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
              {targetUser.name}
              {targetUser.openChat && (
                <Shield
                  className="h-4 w-4 text-green-500"
                  title="Open Chat Habilitado"
                />
              )}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge variant="outline" className="capitalize">
                {targetUser.role === 'contractor' ? 'Contratante' : 'Executor'}
              </Badge>
              <Badge variant="secondary" className="text-yellow-600">
                ★ {targetUser.reputation}
              </Badge>
              <Badge variant="outline">{targetUser.location}</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto sm:mx-0">
              Profissional verificado pela plataforma BIDWORK. Avaliado
              positivamente por clientes anteriores em quesitos como prazo e
              qualidade.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button
              size="lg"
              onClick={handleAction}
              className="w-full"
              disabled={existingInterest?.status === 'pending'}
            >
              {canMessage ? (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" /> Enviar Mensagem
                </>
              ) : existingInterest?.status === 'pending' ? (
                <>
                  <Heart className="mr-2 h-4 w-4" /> Interesse Pendente
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" /> Demonstrar Interesse
                </>
              )}
            </Button>
            {!canMessage && !existingInterest && (
              <p className="text-xs text-muted-foreground text-center max-w-[200px] mx-auto mt-2">
                Este usuário possui chat fechado. <br /> Assine um plano Premium
                para envio direto.
              </p>
            )}
            {isPremium && !targetUser.openChat && !existingConversation && (
              <div className="mt-2 text-center bg-primary/10 text-primary px-3 py-1.5 rounded-md text-xs font-medium border border-primary/20">
                Benefício Premium: Chat liberado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
