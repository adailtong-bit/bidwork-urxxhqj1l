import { useAuthStore } from '@/stores/useAuthStore'
import { useAdminPricingStore } from '@/stores/useAdminPricingStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function SubscriptionPlans() {
  const { user, upgradeSubscription } = useAuthStore()
  const { plans } = useAdminPricingStore()
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  const handleSubscribe = (tierName: string) => {
    upgradeSubscription('pro')
    toast({
      title: 'Assinatura Atualizada!',
      description: `Parabéns! Agora você tem acesso aos recursos do plano ${tierName}.`,
    })
  }

  // Filter plans based on standardized target audience logic and user roles
  const availablePlans = plans.filter((p) => {
    if (!p.active) return false

    if (user) {
      if (user.role === 'executor') {
        return p.targetAudience === 'executor'
      } else if (user.role === 'contractor') {
        return p.targetAudience === 'contractor'
      } else if (user.role === 'partner') {
        return p.targetAudience === 'advertiser'
      } else if (user.role === 'admin') {
        return true
      }
    }

    // Default view for public visitors
    return true
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Escolha o plano ideal para sua carreira
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie ferramentas exclusivas, aumente sua visibilidade e feche
          mais negócios com os planos premium.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {availablePlans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative ${
              plan.popular
                ? 'border-primary shadow-xl scale-105 z-10'
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm">
                  Mais Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    plan.popular
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Crown className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatCurrency(plan.price)}
                </span>
                {plan.price !== 0 && (
                  <span className="text-muted-foreground">
                    /{plan.billingCycle === 'monthly' ? 'mês' : 'ciclo'}
                  </span>
                )}
              </div>
              <CardDescription className="mt-2 min-h-[40px]">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.name)}
              >
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
