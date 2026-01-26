import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePaymentStore } from '@/stores/usePaymentStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard, Lock, ShieldCheck } from 'lucide-react'

export default function PaymentCheckout() {
  const { jobId, bidId } = useParams<{ jobId: string; bidId: string }>()
  const navigate = useNavigate()
  const { getJob, acceptBid } = useJobStore()
  const { user } = useAuthStore()
  const { processPayment } = usePaymentStore()
  const { addNotification } = useNotificationStore()
  const { toast } = useToast()

  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [isProcessing, setIsProcessing] = useState(false)

  const job = getJob(jobId!)

  // Logic to determine amount and receiver
  const bid =
    bidId && bidId !== 'fixed' ? job?.bids.find((b) => b.id === bidId) : null

  const amount = bid ? bid.amount : job?.budget || 0
  const receiverName = bid ? bid.executorName : 'Profissional (A Definir)'
  const receiverId = bid ? bid.executorId : 'pending'

  if (!job || !user) return <div className="p-8">Dados inválidos</div>

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    const success = await processPayment(
      job.id,
      job.title,
      amount,
      { id: user.id, name: user.name },
      { id: receiverId, name: receiverName },
    )

    if (success) {
      // Logic to finalize the job status
      if (bid) {
        acceptBid(job.id, bid.id)

        // Notify Executor
        addNotification({
          userId: bid.executorId,
          title: 'Proposta Aceita e Paga!',
          message: `O contratante pagou R$ ${amount} (Escrow). Pode iniciar o job "${job.title}".`,
          type: 'success',
          link: `/jobs/${job.id}`,
        })
      }

      setIsProcessing(false)
      navigate('/payment/success')
    } else {
      setIsProcessing(false)
      toast({
        variant: 'destructive',
        title: 'Erro no pagamento',
        description: 'Tente novamente.',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Checkout Seguro</h1>
        <p className="text-muted-foreground">
          Finalize a contratação para iniciar o serviço.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
              <CardDescription>Selecione como deseja pagar.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid gap-4"
              >
                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="credit-card" id="cc" />
                  <Label
                    htmlFor="cc"
                    className="flex items-center gap-2 cursor-pointer w-full"
                  >
                    <CreditCard className="h-5 w-5" /> Cartão de Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label
                    htmlFor="pix"
                    className="flex items-center gap-2 cursor-pointer w-full"
                  >
                    <span className="font-bold text-emerald-600">PIX</span>{' '}
                    (Aprovação Imediata)
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'credit-card' && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm text-center text-muted-foreground">
                  Simulação: Cartão Final 4242 (Mock)
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-100">
            <Lock className="h-4 w-4 text-blue-600" />
            <p>
              Seus dados estão protegidos. O valor fica retido (Escrow) até a
              conclusão do serviço.
            </p>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Serviço
                </p>
                <p className="font-semibold">{job.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Profissional
                </p>
                <p className="font-semibold">{receiverName}</p>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {amount.toFixed(2)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Processando...
                  </>
                ) : (
                  <>Pagar e Contratar</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
