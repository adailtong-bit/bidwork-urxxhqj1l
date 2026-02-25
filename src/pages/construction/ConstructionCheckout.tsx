import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminPricingStore } from '@/stores/useAdminPricingStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CreditCard, Loader2, ShieldCheck, Lock } from 'lucide-react'

export default function ConstructionCheckout() {
  const { planId } = useParams()
  const { plans } = useAdminPricingStore()
  const { activateConstructionSubscription } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  const plan = plans.find((p) => p.id === planId)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentType, setPaymentType] = useState('credit')

  if (!plan)
    return <div className="p-10 text-center">Plano não encontrado.</div>

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment API call
    setTimeout(() => {
      activateConstructionSubscription({
        limit: plan.maxProjects,
        price: plan.price,
      })
      toast({
        title: 'Assinatura confirmada!',
        description: 'Recursos de gestão de obras desbloqueados.',
      })
      setIsProcessing(false)
      navigate('/post-job')
    }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Checkout Seguro</h1>
        <p className="text-muted-foreground">
          Finalize sua assinatura para liberar a Gestão de Obras.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handlePayment} id="checkout-form">
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>
                  Aceitamos cartões de crédito e débito.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={paymentType}
                  onValueChange={setPaymentType}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label
                      htmlFor="credit"
                      className="flex items-center gap-2 cursor-pointer w-full font-medium"
                    >
                      <CreditCard className="h-5 w-5 text-blue-600" /> Cartão de
                      Crédito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label
                      htmlFor="debit"
                      className="flex items-center gap-2 cursor-pointer w-full font-medium"
                    >
                      <CreditCard className="h-5 w-5 text-green-600" /> Cartão
                      de Débito
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="Ex: JOAO DA SILVA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Validade (MM/AA)</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-100">
            <Lock className="h-4 w-4 text-blue-600 shrink-0" />
            <p>
              Pagamento processado com segurança via Stripe. Seus dados estão
              criptografados de ponta a ponta.
            </p>
          </div>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo da Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Plano Selecionado
                </p>
                <p className="font-semibold text-lg">{plan.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Cobrança
                </p>
                <p className="font-medium">Mensal Recorrente</p>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold">Total a Pagar</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(plan.price)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                form="checkout-form"
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{' '}
                    Processando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-5 w-5" /> Confirmar Pagamento
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
