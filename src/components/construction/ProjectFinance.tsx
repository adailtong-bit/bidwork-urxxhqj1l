import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  PieChart,
  WalletCards,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectFinanceCosts } from './ProjectFinanceCosts'
import { ProjectFinanceAccounts } from './ProjectFinanceAccounts'
import { ProjectFinanceLedger } from './ProjectFinanceLedger'

export function ProjectFinance({ projectId }: { projectId: string }) {
  const { getProject } = useProjectStore()
  const { formatCurrency } = useLanguageStore()
  const project = getProject(projectId)

  if (!project) return null

  const movements = project.financialMovements || []
  const stages = project.stages || []
  const budgetItemsList = project.budgetItems || []
  const ledgerEntries = project.ledgerEntries || []

  const totalBudgetItems = budgetItemsList.reduce(
    (acc, item) => acc + item.totalCost,
    0,
  )
  const totalStagesBudget = stages.reduce(
    (acc, s) => acc + s.budgetMaterial + s.budgetLabor,
    0,
  )
  const calculatedTotalBudget = totalBudgetItems + totalStagesBudget

  const totalOutflows = movements
    .filter((m) => m.type === 'out')
    .reduce((acc, m) => acc + m.amount, 0)

  const totalLedgerPaid = ledgerEntries
    .filter(
      (l) => l.paymentStatus === 'paid' || l.paymentStatus === 'partially_paid',
    )
    .reduce((acc, l) => acc + l.finalCost, 0)

  const totalDespesas = totalOutflows + totalLedgerPaid

  const overallProgress =
    stages.length > 0
      ? stages.reduce((acc, s) => acc + s.progress, 0) / stages.length
      : 0

  const earnedValue = calculatedTotalBudget * (overallProgress / 100)
  const financialVariance = earnedValue - totalDespesas

  let delayedCount = 0
  stages.forEach((s) => {
    if (s.status === 'delayed') delayedCount++
    s.subStages.forEach((sub) => {
      if (sub.status === 'delayed') delayedCount++
    })
  })

  const estimatedDelayImpactPerTask = 500
  const totalDelayImpact = delayedCount * estimatedDelayImpactPerTask
  const isOverBudget = financialVariance < 0

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="pb-4">
        <CardTitle>Painel Financeiro Integrado</CardTitle>
        <CardDescription>
          Acompanhamento centralizado: Orçamento vs. Despesas Conta Corrente e
          Ledger.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Orçamento (Planejado)
            </p>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(calculatedTotalBudget)}
              </span>
            </div>
          </div>

          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-xl border border-purple-100 dark:border-purple-900/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Saídas (Conta Corrente)
            </p>
            <div className="flex items-center gap-2">
              <WalletCards className="h-5 w-5 text-purple-500" />
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(totalOutflows)}
              </span>
            </div>
          </div>

          <div className="bg-orange-50/50 dark:bg-orange-950/20 p-5 rounded-xl border border-orange-100 dark:border-orange-900/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Custo Executado (Ledger)
            </p>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(totalLedgerPaid)}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'p-5 rounded-xl border',
              isOverBudget
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50',
            )}
          >
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Variância Geral
            </p>
            <div className="flex items-center gap-2">
              {isOverBudget ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-green-600" />
              )}
              <span
                className={cn(
                  'text-xl font-bold',
                  isOverBudget
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-green-700 dark:text-green-400',
                )}
              >
                {isOverBudget ? '' : '+'}
                {formatCurrency(financialVariance)}
              </span>
            </div>
          </div>
        </div>

        {delayedCount > 0 && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Alerta de Impacto no Custo (Atrasos)</AlertTitle>
            <AlertDescription>
              O cronograma possui <strong>{delayedCount}</strong> marcos/tarefas
              em atraso. O impacto estimado nos custos indiretos (Soft Costs) é
              de <strong>{formatCurrency(totalDelayImpact)}</strong>, aumentando
              o consumo do orçamento.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="visao_geral" className="w-full min-w-0">
          <div className="w-full overflow-x-auto pb-2 mb-4 -mx-2 px-2">
            <TabsList className="w-full max-w-[700px] grid grid-cols-3 h-auto p-1 min-w-[400px]">
              <TabsTrigger
                value="visao_geral"
                className="py-2 flex items-center gap-2 text-xs md:text-sm whitespace-normal text-center"
              >
                <PieChart className="w-4 h-4 hidden sm:block" /> Custos Alocados
              </TabsTrigger>
              <TabsTrigger
                value="conta_corrente"
                className="py-2 flex items-center gap-2 text-xs md:text-sm whitespace-normal text-center"
              >
                <WalletCards className="w-4 h-4 hidden sm:block" /> Conta
                Corrente
              </TabsTrigger>
              <TabsTrigger
                value="ledger"
                className="py-2 flex items-center gap-2 text-xs md:text-sm whitespace-normal text-center"
              >
                <BookOpen className="w-4 h-4 hidden sm:block" /> Diário (Ledger)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visao_geral" className="w-full min-w-0 m-0">
            <ProjectFinanceCosts projectId={projectId} />
          </TabsContent>

          <TabsContent value="conta_corrente" className="w-full min-w-0 m-0">
            <ProjectFinanceAccounts projectId={projectId} />
          </TabsContent>

          <TabsContent value="ledger" className="w-full min-w-0 m-0">
            <ProjectFinanceLedger projectId={projectId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
