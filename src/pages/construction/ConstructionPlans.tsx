import { useAdminPricingStore } from '@/stores/useAdminPricingStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Check, HardHat, Building2, Crown } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ConstructionPlans() {
  const { plans } = useAdminPricingStore()
  const navigate = useNavigate()
  const { formatCurrency } = useLanguageStore()

  const availablePlans = plans.filter(
    (p) => p.active && p.targetAudience === 'contractor',
  )

  const getIcon = (complexity?: string) => {
    switch (complexity) {
      case 'High':
        return <Crown className="h-8 w-8 text-amber-500 mb-2" />
      case 'Medium':
        return <Building2 className="h-8 w-8 text-blue-500 mb-2" />
      default:
        return <HardHat className="h-8 w-8 text-orange-500 mb-2" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-10 px-4">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">
          Planos de Gestão de Obras
        </h1>
        <p className="text-xl text-muted-foreground">
          Escolha o plano ideal para o tamanho e complexidade do seu projeto.
          Desbloqueie ferramentas avançadas de controle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {availablePlans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative border-border hover:border-primary/50 transition-colors`}
          >
            <CardHeader>
              {getIcon(plan.complexity)}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-muted-foreground">
                  /{plan.billingCycle === 'monthly' ? 'mês' : 'ciclo'}
                </span>
              </div>
              <CardDescription className="mt-2 min-h-[40px]">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.workSize && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">
                      Tamanho da Obra: <strong>{plan.workSize}</strong>
                    </span>
                  </li>
                )}
                {plan.maxProjects && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">
                      Limite de Projetos Ativos:{' '}
                      <strong>{plan.maxProjects}</strong>
                    </span>
                  </li>
                )}
                {plan.complexity && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">
                      Complexidade de Gestão:{' '}
                      <strong>
                        {plan.complexity === 'Low'
                          ? 'Baixa'
                          : plan.complexity === 'Medium'
                            ? 'Média'
                            : 'Alta'}
                      </strong>
                    </span>
                  </li>
                )}
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
                size="lg"
                onClick={() => navigate(`/construction/checkout/${plan.id}`)}
              >
                Selecionar Plano
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
