import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import {
  MapPin,
  Calendar,
  DollarSign,
  Gavel,
  ShieldAlert,
  Send,
  Clock,
  AlertOctagon,
  CheckCircle,
  MessageSquare,
  CalendarDays,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'
import { addHours } from 'date-fns'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getJob, addBid, completeJob, openDispute } = useJobStore()
  const { user, setPendingEvaluation } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const { toast } = useToast()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const job = getJob(id!)
  const [bidAmount, setBidAmount] = useState('')
  const [bidDescription, setBidDescription] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([
    {
      user: 'Sistema',
      text: 'Chat seguro iniciado. O pagamento está protegido em Escrow.',
    },
  ])

  if (!job) return <div className="p-8">{t('job.not_found')}</div>
  if (!user) return <div className="p-8">{t('job.login_required')}</div>

  const isOwner = user.id === job.ownerId
  const hasBidded = job.bids.some((b) => b.executorId === user.id)
  const acceptedBid = job.acceptedBidId
    ? job.bids.find((b) => b.id === job.acceptedBidId)
    : null
  const isExecutor = acceptedBid?.executorId === user.id

  // Calculate current lowest bid for validation
  const lowestBid =
    job.bids.length > 0
      ? Math.min(...job.bids.map((b) => b.amount))
      : job.budget

  const handleBid = () => {
    if (!bidAmount || !bidDescription) return

    const amount = Number(bidAmount)

    // Reverse Auction Validation: Must be lower than current max/lowest
    if (job.type === 'auction') {
      if (amount >= lowestBid) {
        toast({
          variant: 'destructive',
          title: 'Lance inválido',
          description: `${t('job.auction_warning')} ${formatCurrency(lowestBid)}`,
        })
        return
      }
    }

    addBid(job.id, {
      jobId: job.id,
      executorId: user.id,
      executorName: user.name,
      amount: amount,
      description: bidDescription,
      executorReputation: user.reputation,
    })

    // Notify Contractor
    addNotification({
      userId: job.ownerId,
      title: 'Novo Lance Recebido!',
      message: `Você recebeu um lance de ${formatCurrency(amount)} no job "${job.title}".`,
      type: 'info',
      link: `/jobs/${job.id}`,
    })

    toast({
      title: 'Lance enviado!',
      description: 'O contratante será notificado.',
    })
    setBidAmount('')
    setBidDescription('')
  }

  const handleAcceptBid = (bidId: string) => {
    // Redirect to checkout flow
    navigate(`/payment/checkout/${job.id}/${bidId}`)
  }

  const handleComplete = () => {
    setPendingEvaluation({
      jobId: job.id,
      targetId: acceptedBid?.executorId || '',
      targetName: acceptedBid?.executorName || '',
      type: 'contractor_to_executor',
    })

    completeJob(job.id)
    toast({
      title: 'Job Finalizado',
      description: 'Por favor, avalie o executor para liberar o pagamento.',
    })
  }

  const handleExecutorEvaluation = () => {
    if (!isExecutor) return
    setPendingEvaluation({
      jobId: job.id,
      targetId: job.ownerId,
      targetName: job.ownerName,
      type: 'executor_to_contractor',
    })
    window.location.reload()
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

  const generateCalendarLink = (type: 'google' | 'outlook') => {
    const title = encodeURIComponent(job.title)
    const description = encodeURIComponent(job.description)
    const location = encodeURIComponent(job.location)
    const startDate = job.maxExecutionDeadline || new Date()
    const endDate = addHours(startDate, 2)

    const formatDateGoogle = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, '')

    if (type === 'google') {
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${formatDateGoogle(startDate)}/${formatDateGoogle(endDate)}`
    } else {
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&location=${location}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`
    }
  }

  const canViewChat = isOwner || isExecutor

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
                : job.status === 'suspended'
                  ? 'Aguardando Execução'
                  : job.status === 'in_progress'
                    ? 'Em Execução'
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
              <Calendar className="h-4 w-4" /> {t('job.published')}:{' '}
              {formatDate(job.publicationDate, 'dd/MM/yyyy')}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {job.type === 'auction' ? t('job.max_initial') : t('job.budget')}
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(job.budget)}
            </div>
            {job.type === 'auction' && job.bids.length > 0 && (
              <div className="text-xs font-semibold text-emerald-600">
                {t('job.best_offer')}: {formatCurrency(lowestBid)}
              </div>
            )}
            <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
              {job.type === 'auction' ? (
                <Gavel className="h-3 w-3" />
              ) : (
                <DollarSign className="h-3 w-3" />
              )}
              {job.type === 'auction'
                ? t('job.auction_reverse')
                : t('job.fixed_price')}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                <CalendarDays className="mr-2 h-4 w-4" /> {t('job.schedule')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a
                  href={generateCalendarLink('google')}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Google Calendar
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={generateCalendarLink('outlook')}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Outlook
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('job.description')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
              {job.photos && job.photos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> {t('job.photos')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {job.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Job photo ${i + 1}`}
                        className="rounded-lg border object-cover w-full h-32 hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isOwner && job.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('job.proposals')} ({job.bids.length})
                </CardTitle>
                <CardDescription>
                  {job.type === 'auction'
                    ? t('job.auction_active')
                    : t('job.choose_best')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.bids.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    {t('job.proposals.empty')}
                  </div>
                ) : (
                  job.bids
                    .sort((a, b) => a.amount - b.amount)
                    .map((bid) => (
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
                            {formatDate(bid.createdAt, 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(bid.amount)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptBid(bid.id)}
                          >
                            {t('job.accept_pay')}
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          )}

          {(job.status === 'suspended' ||
            job.status === 'in_progress' ||
            job.status === 'completed' ||
            job.status === 'dispute') &&
            canViewChat && (
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" /> {t('job.chat_room')}
                    </span>
                    {job.status !== 'completed' &&
                      job.status !== 'cancelled' && (
                        <Badge className="bg-indigo-500 hover:bg-indigo-600">
                          {t('job.escrow')}:{' '}
                          {formatCurrency(acceptedBid?.amount || 0)}
                        </Badge>
                      )}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span>
                      {t('status')}:{' '}
                      {job.status === 'dispute'
                        ? t('job.status.dispute')
                        : t('job.status.execution')}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-background">
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
                      disabled={
                        job.status === 'completed' || job.status === 'dispute'
                      }
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={
                        job.status === 'completed' || job.status === 'dispute'
                      }
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col md:flex-row justify-between bg-muted/30 p-4 border-t gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 border-destructive/20 w-full md:w-auto"
                    onClick={handleDispute}
                    disabled={
                      job.status === 'completed' || job.status === 'dispute'
                    }
                  >
                    <AlertOctagon className="mr-2 h-4 w-4" />{' '}
                    {t('job.dispute.open')}
                  </Button>

                  {isOwner &&
                    (job.status === 'suspended' ||
                      job.status === 'in_progress') && (
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                        onClick={handleComplete}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />{' '}
                        {t('job.complete')}
                      </Button>
                    )}
                  {isExecutor && job.status === 'completed' && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                      onClick={handleExecutorEvaluation}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />{' '}
                      {t('job.rate_contractor')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
        </div>

        <div className="space-y-6">
          {!isOwner && job.status === 'open' && !hasBidded && (
            <Card>
              <CardHeader>
                <CardTitle>{t('job.make_offer')}</CardTitle>
                {job.type === 'auction' && (
                  <CardDescription className="text-amber-600 font-medium">
                    {t('job.auction_warning')} {formatCurrency(lowestBid)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('job.value_label')} ({t('dashboard.chart.label.value')})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    max={job.type === 'auction' ? lowestBid - 1 : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('job.proposal_label')}
                  </label>
                  <Textarea
                    placeholder="Detalhes sobre sua execução..."
                    value={bidDescription}
                    onChange={(e) => setBidDescription(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleBid}>
                  {t('job.send_bid')}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> {t('job.payment_protected')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-blue-700">
              <p>{t('job.payment_desc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
