import { useState } from 'react'
import { useProjectStore, ProjectLedgerEntry } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  CalendarDays,
  Edit2,
  Trash2,
} from 'lucide-react'
import { CurrencyInput } from '@/components/CurrencyInput'
import { cn } from '@/lib/utils'

interface ProjectExecutionProps {
  projectId: string
}

export function ProjectExecution({ projectId }: ProjectExecutionProps) {
  const { getProject, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry } =
    useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const { toast } = useToast()
  const project = getProject(projectId)

  // Ledger State
  const [isLedgerOpen, setIsLedgerOpen] = useState(false)
  const [editingLedger, setEditingLedger] = useState<ProjectLedgerEntry | null>(
    null,
  )
  const [ledgerForm, setLedgerForm] = useState<Partial<ProjectLedgerEntry>>({
    description: '',
    origin: '',
    partnerId: '',
    estimatedCost: 0,
    finalCost: 0,
    paymentStatus: 'pending',
    executionStatus: 'pending',
  })
  const [dates, setDates] = useState({
    purchaseDate: '',
    deliveryDate: '',
    startDate: '',
    endDate: '',
  })

  if (!project) return null

  // Ledger Check
  const getPartnerCompliance = (partnerId: string) => {
    const docs = project.complianceDocuments || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return docs.filter(
      (d) =>
        (d.partnerId === partnerId || d.partnerId === 'general') &&
        d.isCritical &&
        new Date(d.expirationDate) < today,
    )
  }

  const ledgerEntries = project.ledgerEntries || []
  const estLedger = ledgerEntries.reduce((a, b) => a + b.estimatedCost, 0)
  const actLedger = ledgerEntries.reduce((a, b) => a + b.finalCost, 0)

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

  const totalEst = estCapex + estSoft + estLedger
  const totalAct = actCapex + actSoft + actLedger

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

  const handleOpenLedger = (entry?: ProjectLedgerEntry) => {
    if (entry) {
      setEditingLedger(entry)
      setLedgerForm(entry)
      setDates({
        purchaseDate: entry.purchaseDate
          ? new Date(entry.purchaseDate).toISOString().split('T')[0]
          : '',
        deliveryDate: entry.deliveryDate
          ? new Date(entry.deliveryDate).toISOString().split('T')[0]
          : '',
        startDate: entry.startDate
          ? new Date(entry.startDate).toISOString().split('T')[0]
          : '',
        endDate: entry.endDate
          ? new Date(entry.endDate).toISOString().split('T')[0]
          : '',
      })
    } else {
      setEditingLedger(null)
      setLedgerForm({
        description: '',
        origin: '',
        partnerId: '',
        estimatedCost: 0,
        finalCost: 0,
        paymentStatus: 'pending',
        executionStatus: 'pending',
      })
      setDates({
        purchaseDate: '',
        deliveryDate: '',
        startDate: '',
        endDate: '',
      })
    }
    setIsLedgerOpen(true)
  }

  const handleSaveLedger = () => {
    const payload = {
      ...ledgerForm,
      purchaseDate: dates.purchaseDate
        ? new Date(dates.purchaseDate + 'T12:00:00')
        : undefined,
      deliveryDate: dates.deliveryDate
        ? new Date(dates.deliveryDate + 'T12:00:00')
        : undefined,
      startDate: dates.startDate
        ? new Date(dates.startDate + 'T12:00:00')
        : undefined,
      endDate: dates.endDate
        ? new Date(dates.endDate + 'T12:00:00')
        : undefined,
    } as Omit<ProjectLedgerEntry, 'id'>

    if (editingLedger) {
      updateLedgerEntry(projectId, editingLedger.id, payload)
      toast({ title: 'Registro financeiro atualizado.' })
    } else {
      addLedgerEntry(projectId, payload)
      toast({ title: 'Registro financeiro adicionado.' })
    }
    setIsLedgerOpen(false)
  }

  return (
    <div className="space-y-6 min-w-0">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
            <div>
              <CardTitle>Diário de Execução Financeira (Ledger)</CardTitle>
              <CardDescription>
                Gerencie todos os custos, fornecedores e cronograma de serviços.
              </CardDescription>
            </div>
            <div className="flex gap-4 items-center bg-muted/20 p-2 rounded-lg border">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Previsto</p>
                <p className="font-bold">{formatCurrency(estLedger)}</p>
              </div>
              <div className="h-8 w-px bg-border mx-2" />
              <div className="text-right mr-4">
                <p className="text-xs text-muted-foreground">Total Final</p>
                <p className="font-bold text-primary">
                  {formatCurrency(actLedger)}
                </p>
              </div>
              <Button onClick={() => handleOpenLedger()} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Novo Registro
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto w-full max-w-full block">
            <Table className="min-w-[1200px] w-full">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Descrição do Serviço</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Empresa Fornecedora</TableHead>
                  <TableHead>Data de Compra</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Data de Início da Execução</TableHead>
                  <TableHead>Data de Término da Execução</TableHead>
                  <TableHead className="text-right">Custo Previsto</TableHead>
                  <TableHead className="text-right">Custo Final</TableHead>
                  <TableHead className="text-center">
                    Status do Pagamento
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.length > 0 ? (
                  ledgerEntries.map((l) => {
                    const expiredDocs = getPartnerCompliance(l.partnerId)
                    const partnerName =
                      project.partners.find((p) => p.id === l.partnerId)
                        ?.companyName || 'N/A'
                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <p className="font-medium">{l.description}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{l.origin || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 font-medium">
                            <span>{partnerName}</span>
                            {expiredDocs.length > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-[10px] w-fit whitespace-nowrap"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Bloqueio de Compliance
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {l.purchaseDate
                              ? formatDate(
                                  new Date(l.purchaseDate),
                                  'dd/MM/yyyy',
                                )
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {l.deliveryDate
                              ? formatDate(
                                  new Date(l.deliveryDate),
                                  'dd/MM/yyyy',
                                )
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {l.startDate
                              ? formatDate(new Date(l.startDate), 'dd/MM/yyyy')
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {l.endDate
                              ? formatDate(new Date(l.endDate), 'dd/MM/yyyy')
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground line-through text-xs">
                          {formatCurrency(l.estimatedCost)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(l.finalCost)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={l.paymentStatus}
                            onValueChange={(val) =>
                              updateLedgerEntry(projectId, l.id, {
                                paymentStatus: val as any,
                              })
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                'h-7 border text-[10px] w-[120px] mx-auto',
                                l.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : l.paymentStatus === 'overdue'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : l.paymentStatus === 'partially_paid'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-secondary',
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="partially_paid">
                                Parcialmente Pago
                              </SelectItem>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="overdue">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar"
                              onClick={() => handleOpenLedger(l)}
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Excluir"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => deleteLedgerEntry(projectId, l.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhum registro financeiro / serviço adicionado ao Ledger.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
          <div className="rounded-md border overflow-x-auto w-full">
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

      {/* Ledger Modal Form */}
      <Dialog
        open={isLedgerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLedger(null)
            setLedgerForm({
              description: '',
              origin: '',
              partnerId: '',
              estimatedCost: 0,
              finalCost: 0,
              paymentStatus: 'pending',
              executionStatus: 'pending',
            })
            setDates({
              purchaseDate: '',
              deliveryDate: '',
              startDate: '',
              endDate: '',
            })
          }
          setIsLedgerOpen(open)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLedger
                ? 'Editar Registro Financeiro'
                : 'Novo Registro Financeiro'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Descrição do Serviço <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={ledgerForm.description}
                  onChange={(e) =>
                    setLedgerForm({
                      ...ledgerForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Ex: Instalação Hidráulica"
                />
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Input
                  value={ledgerForm.origin}
                  placeholder="Ex: Contrato X, Pedido Y"
                  onChange={(e) =>
                    setLedgerForm({ ...ledgerForm, origin: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Empresa Fornecedora <span className="text-red-500">*</span>
              </Label>
              <Select
                value={ledgerForm.partnerId}
                onValueChange={(val) =>
                  setLedgerForm({ ...ledgerForm, partnerId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Fornecedor vinculado" />
                </SelectTrigger>
                <SelectContent>
                  {project.partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Compra</Label>
                <Input
                  type="date"
                  value={dates.purchaseDate}
                  onChange={(e) =>
                    setDates({ ...dates, purchaseDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Entrega</Label>
                <Input
                  type="date"
                  value={dates.deliveryDate}
                  onChange={(e) =>
                    setDates({ ...dates, deliveryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início da Execução</Label>
                <Input
                  type="date"
                  value={dates.startDate}
                  onChange={(e) =>
                    setDates({ ...dates, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Término da Execução</Label>
                <Input
                  type="date"
                  value={dates.endDate}
                  onChange={(e) =>
                    setDates({ ...dates, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Custo Previsto</Label>
                <CurrencyInput
                  value={ledgerForm.estimatedCost || 0}
                  onChange={(val) =>
                    setLedgerForm({ ...ledgerForm, estimatedCost: val })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Final</Label>
                <CurrencyInput
                  value={ledgerForm.finalCost || 0}
                  onChange={(val) =>
                    setLedgerForm({ ...ledgerForm, finalCost: val })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status do Pagamento</Label>
                <Select
                  value={ledgerForm.paymentStatus}
                  onValueChange={(val) =>
                    setLedgerForm({
                      ...ledgerForm,
                      paymentStatus: val as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="partially_paid">
                      Parcialmente Pago
                    </SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!ledgerForm.description || !ledgerForm.partnerId}
              onClick={handleSaveLedger}
            >
              Salvar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
