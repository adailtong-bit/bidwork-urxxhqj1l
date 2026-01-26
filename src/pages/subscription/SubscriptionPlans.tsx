import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Zap, Crown, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export default function SubscriptionPlans() {
  const { user, upgradeSubscription } = useAuthStore()
  const { toast } = useToast()

  const handleSubscribe = (tier: 'pro' | 'business') => {
    upgradeSubscription(tier)
    toast({
      title: 'Assinatura Atualizada!',
      description: `Parabéns! Agora você é membro ${tier.toUpperCase()}.`,
    })
  }

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      description: 'Para quem está começando',
      features: [
        'Acesso a jobs básicos',
        'Perfil padrão',
        'Taxa de serviço de 15%',
        'Suporte por email',
      ],
      current: user?.subscriptionTier === 'free',
      icon: Shield,
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 'R$ 49,90/mês',
      description: 'Para freelancers ativos',
      features: [
        'Destaque Regional em buscas',
        'Taxa de serviço reduzida (10%)',
        'Relatórios de desempenho',
        '50 Créditos mensais para lances',
        'Selo "Pro" no perfil',
      ],
      current: user?.subscriptionTier === 'pro',
      popular: true,
      icon: Zap,
    },
    {
      id: 'business',
      name: 'Business',
      price: 'R$ 149,90/mês',
      description: 'Para agências e alta demanda',
      features: [
        'Destaque Nacional em buscas',
        'Taxa de serviço mínima (5%)',
        'Dashboards avançados de mercado',
        'Créditos ilimitados para lances',
        'Gerente de conta dedicado',
        'API de integração',
      ],
      current: user?.subscriptionTier === 'business',
      icon: Crown,
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Escolha o plano ideal para sua carreira
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Desbloqueie ferramentas exclusivas, aumente sua visibilidade e feche
          mais negócios com os planos Premium do BIDWORK.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {plans.map((plan) => (
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
                    plan.id === 'business'
                      ? 'bg-yellow-100 text-yellow-600'
                      : plan.id === 'pro'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <plan.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'R$ 0' && (
                  <span className="text-muted-foreground">/mês</span>
                )}
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
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
                variant={
                  plan.current
                    ? 'outline'
                    : plan.popular
                      ? 'default'
                      : 'secondary'
                }
                disabled={plan.current}
                onClick={() =>
                  plan.id !== 'free' &&
                  handleSubscribe(plan.id as 'pro' | 'business')
                }
              >
                {plan.current ? 'Plano Atual' : 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
