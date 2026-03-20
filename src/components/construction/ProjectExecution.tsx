import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  CalendarDays,
  FileText,
} from 'lucide-react'
import { CurrencyInput } from '@/components/CurrencyInput'
import { cn } from '@/lib/utils'

interface ProjectExecutionProps {
  projectId: string
}

export function ProjectExecution({ projectId }: ProjectExecutionProps) {
  const { getProject, addLaborAdjustment } = useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const project = getProject(projectId)

  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState(0)

  if (!project) return null

  const receiptLabel =
    project.region === 'US' ? 'Invoices / Receipts' : 'Notas Fiscais / Recibos'

  // Cost Aggregations (Separating CAPEX and Soft Costs)
  const budgetItems = project.budgetItems || []
  const allocatedCosts = project.allocatedCosts || []

  const estCapex =
    budgetItems
      .filter((i) => i.costClass === 'capex' || !i.costClass)
      .reduce((a, b) => a + b.totalCost, 0) +
    project.stages.reduce((a, s) => a + s.budgetMaterial + s.budgetLabor, 0)
  const actCapex =
    allocatedCosts
      .filter((c) => c.costClass === 'capex' || !c.costClass)
      .reduce((a, b) => a + b.amount, 0) +
    project.stages.reduce((a, s) => a + s.actualMaterial + s.actualLabor, 0) +
    (project.laborAdjustments?.reduce((a, adj) => a + adj.amount, 0) || 0)

  const estSoft = budgetItems
    .filter((i) => i.costClass === 'soft_cost')
    .reduce((a, b) => a + b.totalCost, 0)
  const actSoft = allocatedCosts
    .filter((c) => c.costClass === 'soft_cost')
    .reduce((a, b) => a + b.amount, 0)

  const estMat =
    project.stages.reduce((acc, s) => acc + s.budgetMaterial, 0) +
    (project.budgetItems
      ?.filter((i) => i.category === 'material')
      .reduce((acc, i) => acc + i.totalCost, 0) || 0)
  const actMat =
    project.stages.reduce((acc, s) => acc + s.actualMaterial, 0) +
    (project.allocatedCosts
      ?.filter((c) => c.category === 'material')
      .reduce((acc, c) => acc + c.amount, 0) || 0)

  const estLab =
    project.stages.reduce((acc, s) => acc + s.budgetLabor, 0) +
    (project.budgetItems
      ?.filter((i) => i.category === 'labor')
      .reduce((acc, i) => acc + i.totalCost, 0) || 0)
  const labAdjs =
    project.laborAdjustments?.reduce((acc, a) => acc + a.amount, 0) || 0
  const actLab =
    project.stages.reduce((acc, s) => acc + s.actualLabor, 0) +
    (project.allocatedCosts
      ?.filter((c) => c.category === 'labor')
      .reduce((acc, c) => acc + c.amount, 0) || 0) +
    labAdjs

  const estOth =
    project.budgetItems
      ?.filter((i) => i.category === 'other')
      .reduce((acc, i) => acc + i.totalCost, 0) || 0
  const actOth =
    project.allocatedCosts
      ?.filter((c) => c.category !== 'material' && c.category !== 'labor')
      .reduce((acc, c) => acc + c.amount, 0) || 0

  const categories = [
    {
      id: 'material',
      name: t('proj.budget.material'),
      est: estMat,
      act: actMat,
    },
    { id: 'labor', name: t('proj.budget.labor'), est: estLab, act: actLab },
    { id: 'other', name: t('proj.budget.other'), est: estOth, act: actOth },
  ]

  const totalEst = estCapex + estSoft
  const totalAct = actCapex + actSoft

  // Timeline & Budget Correlation
  const start = new Date(project.startDate).getTime()
  const end = new Date(project.endDate).getTime()
  const now = new Date().getTime()

  const totalDays = Math.max(1, (end - start) / 86400000)
  const elapsedDays = Math.max(0, (now - start) / 86400000)
  const timeElapsedPct = Math.min(100, (elapsedDays / totalDays) * 100)
  const budgetSpentPct =
    totalEst > 0 ? Math.min(100, (totalAct / totalEst) * 100) : 0

  const progress =
    project.stages.length > 0
      ? project.stages.reduce((acc, s) => acc + s.progress, 0) /
        project.stages.length
      : 0

  let projectedEnd = end
  if (progress > 0 && progress < 100) {
    const daysPerPct = elapsedDays / progress
    projectedEnd = start + daysPerPct * 100 * 86400000
  }

  const isDelayed = projectedEnd > end

  const handleAddAdjustment = () => {
    if (!desc || amount <= 0) return
    addLaborAdjustment(projectId, {
      description: desc,
      amount,
      date: new Date(),
    })
    setDesc('')
    setAmount(0)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-primary md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('proj.execution.timeline_vs_budget')}
            </CardTitle>
            <CardDescription>
              {t('proj.execution.overall_health')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('proj.execution.time_elapsed')}
                </span>
                <span className="font-medium">
                  {timeElapsedPct.toFixed(0)}%
                </span>
              </div>
              <Progress value={timeElapsedPct} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('proj.execution.budget_spent')}
                </span>
                <span
                  className={cn(
                    'font-medium',
                    budgetSpentPct > 100 && 'text-red-500',
                  )}
                >
                  {budgetSpentPct.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={Math.min(100, budgetSpentPct)}
                className={cn(
                  'h-2',
                  budgetSpentPct > 100 && 'bg-red-200 [&>div]:bg-red-500',
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 font-semibold mb-1">
                  CAPEX (Obra Física)
                </p>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">
                    {formatCurrency(estCapex)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Real:</span>
                  <span
                    className={cn(
                      'font-medium',
                      actCapex > estCapex && 'text-red-600',
                    )}
                  >
                    {formatCurrency(actCapex)}
                  </span>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-800 font-semibold mb-1">
                  Soft Costs (Taxas/Docs)
                </p>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{formatCurrency(estSoft)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Real:</span>
                  <span
                    className={cn(
                      'font-medium',
                      actSoft > estSoft && 'text-red-600',
                    )}
                  >
                    {formatCurrency(actSoft)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Previsão Final
            </CardTitle>
            <CardDescription>
              {t('proj.execution.projected_completion')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
            <div className="bg-muted/50 p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">
                {t('proj.execution.planned_completion')}
              </p>
              <div className="flex items-center gap-2 font-medium">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDate(new Date(project.endDate), 'P')}
              </div>
            </div>
            <div
              className={cn(
                'p-3 rounded-lg border',
                isDelayed
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200',
              )}
            >
              <p
                className={cn(
                  'text-xs mb-1',
                  isDelayed ? 'text-red-700' : 'text-green-700',
                )}
              >
                {t('proj.execution.projected_completion')}
              </p>
              <div
                className={cn(
                  'flex items-center gap-2 font-medium',
                  isDelayed ? 'text-red-800' : 'text-green-800',
                )}
              >
                <CalendarDays className="h-4 w-4" />
                {formatDate(new Date(projectedEnd), 'P')}
              </div>
              <p
                className={cn(
                  'text-[10px] mt-1 font-semibold',
                  isDelayed ? 'text-red-600' : 'text-green-600',
                )}
              >
                {isDelayed
                  ? t('proj.execution.delayed')
                  : t('proj.execution.on_track')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('proj.execution.planned_vs_actual')}</CardTitle>
          <CardDescription>{t('proj.finance.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{t('proj.execution.category')}</TableHead>
                  <TableHead className="text-right">
                    {t('proj.execution.estimated')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('proj.execution.actual')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('proj.execution.variance')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('proj.execution.status')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => {
                  const variance = cat.act - cat.est
                  const isOverrun = cat.est > 0 && cat.act > cat.est * 1.1

                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(cat.est)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(cat.act)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOverrun && (
                            <AlertTriangle
                              className="h-4 w-4 text-red-500"
                              title={t('proj.execution.cost_overrun')}
                            />
                          )}
                          <span
                            className={cn(
                              'font-medium',
                              variance > 0 ? 'text-red-600' : 'text-green-600',
                            )}
                          >
                            {variance > 0 ? '+' : ''}
                            {formatCurrency(variance)}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {variance > 0
                            ? t('proj.execution.cost_overrun')
                            : t('proj.execution.savings')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={variance > 0 ? 'destructive' : 'default'}
                          className={cn(
                            variance <= 0 && 'bg-green-500 hover:bg-green-600',
                          )}
                        >
                          {variance > 0
                            ? t('proj.execution.over_budget')
                            : t('proj.execution.on_budget')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
            <div>
              <CardTitle>Pagamentos e Ajustes Extra</CardTitle>
              <CardDescription>
                Registre {receiptLabel} ou ajustes de mão de obra.
              </CardDescription>
            </div>
            <div className="flex gap-4 items-center bg-muted/30 p-3 rounded-lg border">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('proj.execution.labor_estimated')}
                </p>
                <p className="font-medium text-sm">{formatCurrency(estLab)}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('proj.execution.labor_actual')}
                </p>
                <p
                  className={cn(
                    'font-medium text-sm',
                    actLab > estLab && 'text-red-600',
                  )}
                >
                  {formatCurrency(actLab)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-medium">
                {t('finance.description')}
              </label>
              <Input
                placeholder={t('proj.execution.labor_adjustments')}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-medium">
                {t('finance.value')}
              </label>
              <CurrencyInput value={amount} onChange={setAmount} />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={handleAddAdjustment} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> {t('add')}
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            {project.laborAdjustments && project.laborAdjustments.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('finance.description')}</TableHead>
                    <TableHead className="text-right">
                      {t('finance.value')}
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.laborAdjustments.map((adj) => (
                    <TableRow key={adj.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(adj.date, 'P')}
                      </TableCell>
                      <TableCell>{adj.description}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        +{formatCurrency(adj.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={`Anexar ${receiptLabel}`}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                {t('proj.execution.no_adjustments')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
