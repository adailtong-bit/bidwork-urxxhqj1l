import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  MapPin,
  Calendar,
  DollarSign,
  Gavel,
  User,
  CheckCircle,
  ShieldAlert,
  Send,
  Clock,
  AlertOctagon,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getJob, addBid, acceptBid, completeJob, openDispute } = useJobStore()
  const { user, setPendingEvaluation } = useAuthStore()
  const { toast } = useToast()

  const job = getJob(id!)
  const [bidAmount, setBidAmount] = useState('')
  const [bidDescription, setBidDescription] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([
    { user: 'System', text: 'Chat iniciado para registro e suporte.' },
  ])

  if (!job) return <div className="p-8">Job não encontrado</div>
  if (!user) return <div className="p-8">Faça login para ver este job</div>

  const isOwner = user.id === job.ownerId
  const hasBidded = job.bids.some((b) => b.executorId === user.id)
  const acceptedBid = job.acceptedBidId
    ? job.bids.find((b) => b.id === job.acceptedBidId)
    : null
  const isExecutor = acceptedBid?.executorId === user.id

  const handleBid = () => {
    if (!bidAmount || !bidDescription) return
    addBid(job.id, {
      jobId: job.id,
      executorId: user.id,
      executorName: user.name,
      amount: Number(bidAmount),
      description: bidDescription,
      executorReputation: user.reputation,
    })
    toast({
      title: 'Lance enviado!',
      description: 'O contratante será notificado.',
    })
    setBidAmount('')
    setBidDescription('')
  }

  const handleAcceptBid = (bidId: string) => {
    acceptBid(job.id, bidId)
    toast({
      title: 'Proposta Aceita!',
      description: 'Pagamento enviado para Escrow (2% taxa).',
    })
  }

  const handleComplete = () => {
    // Before completing, trigger mandatory evaluation flow
    setPendingEvaluation({
      jobId: job.id,
      targetId: acceptedBid?.executorId || '',
      targetName: acceptedBid?.executorName || '',
      type: 'contractor_to_executor',
    })

    completeJob(job.id)
    toast({
      title: 'Processo de Finalização',
      description: 'Por favor, avalie o executor para liberar o pagamento.',
    })
    // The App.tsx Guard will pick up the pending evaluation and show the modal
  }

  const handleDispute = () => {
    openDispute(job.id)
    navigate(`/disputes/new/${job.id}`)
  }

  const handleSendMessage = () => {
    if (!chatMessage) return
    setMessages([...messages, { user: user.name, text: chatMessage }])
    setChatMessage('')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge>{job.category}</Badge>
            <Badge variant={job.status === 'open' ? 'secondary' : 'outline'}>
              {job.status === 'open'
                ? 'Aberto'
                : job.status === 'in_progress'
                  ? 'Executando'
                  : job.status === 'completed'
                    ? 'Finalizado'
                    : job.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Pub:{' '}
              {format(job.publicationDate, 'dd/MM/yyyy')}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Orçamento / Valor</div>
          <div className="text-2xl font-bold text-primary">
            R$ {job.budget.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
            {job.type === 'auction' ? (
              <Gavel className="h-3 w-3" />
            ) : (
              <DollarSign className="h-3 w-3" />
            )}
            {job.type === 'auction' ? 'Leilão' : 'Preço Fixo'}
          </div>
          {job.type === 'auction' && job.auctionEndDate && (
            <div className="text-xs font-semibold text-orange-600 flex items-center justify-end gap-1 mt-1">
              <Clock className="h-3 w-3" /> Fim:{' '}
              {format(job.auctionEndDate, 'dd/MM HH:mm')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Bids Section */}
          {isOwner && job.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle>Propostas ({job.bids.length})</CardTitle>
                <CardDescription>
                  {job.type === 'auction'
                    ? 'Leilão Ativo. O vencedor será notificado ao final do prazo.'
                    : 'Escolha a melhor oferta.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.bids.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Aguardando ofertas...
                  </div>
                ) : (
                  job.bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-start bg-card/50"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {bid.executorName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-yellow-600 border-yellow-200 bg-yellow-50"
                          >
                            ★ {bid.executorReputation.toFixed(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bid.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {format(bid.createdAt, 'dd/MM/yyyy HH:mm')}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[120px]">
                        <span className="text-xl font-bold text-primary">
                          R$ {bid.amount}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptBid(bid.id)}
                        >
                          Aceitar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Execution Area */}
          {(job.status === 'in_progress' ||
            job.status === 'completed' ||
            job.status === 'dispute') &&
            (isOwner || isExecutor) && (
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center justify-between">
                    <span>Sala de Execução</span>
                    {job.status === 'in_progress' && (
                      <Badge className="bg-indigo-500">
                        Escrow: R$ {(acceptedBid?.amount || 0).toFixed(2)}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span>
                      Status:{' '}
                      {job.status === 'dispute' ? 'EM DISPUTA' : 'Em Andamento'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Taxa de plataforma (2%): R${' '}
                      {((acceptedBid?.amount || 0) * 0.02).toFixed(2)} (Deduzido
                      no repasse final)
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.user === user.name ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${msg.user === user.name ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {msg.user}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      placeholder="Mensagem..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleSendMessage()
                      }
                      disabled={job.status === 'completed'}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={job.status === 'completed'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/30 p-4 border-t">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 border-destructive/20"
                    onClick={handleDispute}
                  >
                    <AlertOctagon className="mr-2 h-4 w-4" /> Abrir Disputa
                  </Button>

                  {isOwner && job.status === 'in_progress' && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleComplete}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Finalizar &
                      Avaliar
                    </Button>
                  )}
                  {isExecutor && job.status === 'completed' && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setPendingEvaluation({
                          jobId: job.id,
                          targetId: job.ownerId,
                          targetName: job.ownerName,
                          type: 'executor_to_contractor',
                        })
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Avaliar
                      Contratante
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {!isOwner && job.status === 'open' && !hasBidded && (
            <Card>
              <CardHeader>
                <CardTitle>Fazer Oferta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor (R$)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proposta</label>
                  <Textarea
                    placeholder="Detalhes..."
                    value={bidDescription}
                    onChange={(e) => setBidDescription(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleBid}>
                  Enviar
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Pagamento Protegido
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-blue-700">
              O pagamento fica retido (Escrow) e só é liberado após a conclusão
              e avaliação mútua. Taxa de 2% aplicável.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
