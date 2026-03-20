import { useState, useMemo } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CurrencyInput } from '@/components/CurrencyInput'
import {
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  DollarSign,
  WalletCards,
  PieChart,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProjectFinance({ projectId }: { projectId: string }) {
  const {
    getProject,
    addCheckingAccount,
    addFinancialMovement,
    addAllocatedCost,
  } = useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const project = getProject(projectId)

  // Account Dialog State
  const [isAddAccOpen, setIsAddAccOpen] = useState(false)
  const [accData, setAccData] = useState({
    name: '',
    bankName: '',
    agency: '',
    accountNumber: '',
    initialBalance: 0,
  })

  // Movement Dialog State
  const [isAddMovOpen, setIsAddMovOpen] = useState(false)
  const [movData, setMovData] = useState({
    accountId: '',
    description: '',
    category: '',
    amount: 0,
    type: 'out',
    date: new Date().toISOString().split('T')[0],
    stageId: 'none',
    budgetItemId: 'none',
  })

  // Allocated Cost Dialog State
  const [isAddCostOpen, setIsAddCostOpen] = useState(false)
  const [costData, setCostData] = useState({
    description: '',
    category: 'material',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    stageId: 'none',
    budgetItemId: 'none',
  })

  const [filterAcc, setFilterAcc] = useState('all')

  const accounts = project?.checkingAccounts || []
  const movements = project?.financialMovements || []
  const allocated = project?.allocatedCosts || []
  const stages = project?.stages || []
  const budgetItemsList = project?.budgetItems || []

  // Calculated Metrics for the unified dashboard
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

  const overallProgress =
    stages.length > 0
      ? stages.reduce((acc, s) => acc + s.progress, 0) / stages.length
      : 0

  const earnedValue = calculatedTotalBudget * (overallProgress / 100)
  const financialVariance = earnedValue - totalOutflows

  // Delay impact calculation
  let delayedCount = 0
  stages.forEach((s) => {
    if (s.status === 'delayed') delayedCount++
    s.subStages.forEach((sub) => {
      if (sub.status === 'delayed') delayedCount++
    })
  })

  const estimatedDelayImpactPerTask = 500 // Mock soft cost penalty per delayed task
  const totalDelayImpact = delayedCount * estimatedDelayImpactPerTask

  const accountBalances = useMemo(() => {
    return accounts.map((acc) => {
      const accMovs = movements.filter((m) => m.accountId === acc.id)
      const ins = accMovs
        .filter((m) => m.type === 'in')
        .reduce((s, m) => s + m.amount, 0)
      const outs = accMovs
        .filter((m) => m.type === 'out')
        .reduce((s, m) => s + m.amount, 0)
      return {
        ...acc,
        currentBalance: acc.initialBalance + ins - outs,
        ins,
        outs,
      }
    })
  }, [accounts, movements])

  const filteredMovements = useMemo(() => {
    let movs = movements
    if (filterAcc !== 'all') {
      movs = movs.filter((m) => m.accountId === filterAcc)
    }
    return movs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [movements, filterAcc])

  if (!project) return null

  const handleAddAccount = () => {
    addCheckingAccount(projectId, accData)
    setIsAddAccOpen(false)
    setAccData({
      name: '',
      bankName: '',
      agency: '',
      accountNumber: '',
      initialBalance: 0,
    })
  }

  const handleAddMovement = () => {
    addFinancialMovement(projectId, {
      accountId: movData.accountId,
      description: movData.description,
      category: movData.category || 'Geral',
      amount: movData.amount,
      type: movData.type as 'in' | 'out',
      date: new Date(movData.date + 'T12:00:00'),
      stageId: movData.stageId !== 'none' ? movData.stageId : undefined,
      budgetItemId:
        movData.budgetItemId !== 'none' ? movData.budgetItemId : undefined,
    })
    setIsAddMovOpen(false)
    setMovData({
      accountId: '',
      description: '',
      category: '',
      amount: 0,
      type: 'out',
      date: new Date().toISOString().split('T')[0],
      stageId: 'none',
      budgetItemId: 'none',
    })
  }

  const handleAddCost = () => {
    addAllocatedCost(projectId, {
      description: costData.description,
      category: costData.category as any,
      amount: costData.amount,
      type: 'actual',
      date: new Date(costData.date + 'T12:00:00'),
      stageId: costData.stageId !== 'none' ? costData.stageId : undefined,
      budgetItemId:
        costData.budgetItemId !== 'none' ? costData.budgetItemId : undefined,
    })
    setIsAddCostOpen(false)
    setCostData({
      description: '',
      category: 'material',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      stageId: 'none',
      budgetItemId: 'none',
    })
  }

  const isOverBudget = financialVariance < 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle>Painel Financeiro Integrado</CardTitle>
        <CardDescription>
          Acompanhamento centralizado: Orçamento vs. Despesas e Impacto do
          Cronograma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Unified Financial Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Orçamento Total (Planejado)
            </p>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(calculatedTotalBudget)}
              </span>
            </div>
          </div>

          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-xl border border-purple-100 dark:border-purple-900/50">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Despesas Reais (Conta Corrente)
            </p>
            <div className="flex items-center gap-2">
              <WalletCards className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(totalOutflows)}
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
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Variância Financeira (Planejado vs Realizado)
            </p>
            <div className="flex items-center gap-2">
              {isOverBudget ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-green-600" />
              )}
              <span
                className={cn(
                  'text-2xl font-bold',
                  isOverBudget
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-green-700 dark:text-green-400',
                )}
              >
                {isOverBudget ? '' : '+'}
                {formatCurrency(financialVariance)}
              </span>
            </div>
            <p
              className={cn(
                'text-xs mt-1 font-medium',
                isOverBudget ? 'text-red-600/80' : 'text-green-600/80',
              )}
            >
              {isOverBudget
                ? 'Acima do orçamento para o progresso atual'
                : 'Dentro do orçamento previsto'}
            </p>
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

        <Tabs defaultValue="visao_geral">
          <TabsList className="mb-6 w-full max-w-[500px] grid grid-cols-2">
            <TabsTrigger
              value="visao_geral"
              className="flex items-center gap-2"
            >
              <PieChart className="w-4 h-4" /> Custos Alocados
            </TabsTrigger>
            <TabsTrigger
              value="conta_corrente"
              className="flex items-center gap-2"
            >
              <WalletCards className="w-4 h-4" /> Conta Corrente
            </TabsTrigger>
          </TabsList>

          {/* CUSTOS ALOCADOS TAB */}
          <TabsContent
            value="visao_geral"
            className="space-y-8 animate-fade-in"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Custos Alocados
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Associe despesas às etapas do cronograma e itens do
                    orçamento.
                  </p>
                </div>
                <Dialog open={isAddCostOpen} onOpenChange={setIsAddCostOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Registrar Custo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Custo Alocado</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Descrição</Label>
                        <Input
                          placeholder="Ex: Compra de cimento"
                          value={costData.description}
                          onChange={(e) =>
                            setCostData({
                              ...costData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Categoria</Label>
                          <Select
                            value={costData.category}
                            onValueChange={(val) =>
                              setCostData({ ...costData, category: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="material">Material</SelectItem>
                              <SelectItem value="labor">Mão de Obra</SelectItem>
                              <SelectItem value="equipment">
                                Equipamento
                              </SelectItem>
                              <SelectItem value="logistics">
                                Logística
                              </SelectItem>
                              <SelectItem value="other">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Valor</Label>
                          <CurrencyInput
                            value={costData.amount}
                            onChange={(val) =>
                              setCostData({ ...costData, amount: val })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Etapa do Cronograma</Label>
                          <Select
                            value={costData.stageId}
                            onValueChange={(val) =>
                              setCostData({ ...costData, stageId: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Opcional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Geral (Nenhuma)
                              </SelectItem>
                              {stages.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Item do Orçamento</Label>
                          <Select
                            value={costData.budgetItemId}
                            onValueChange={(val) =>
                              setCostData({ ...costData, budgetItemId: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Opcional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Geral (Nenhum)
                              </SelectItem>
                              {budgetItemsList.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={costData.date}
                          onChange={(e) =>
                            setCostData({ ...costData, date: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddCost}
                        disabled={!costData.description || !costData.amount}
                      >
                        Salvar Custo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-md bg-card">
                {allocated.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Etapa Relacionada</TableHead>
                        <TableHead>Item do Orçamento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocated
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime(),
                        )
                        .map((cost) => (
                          <TableRow key={cost.id}>
                            <TableCell className="text-muted-foreground text-sm">
                              {cost.date
                                ? formatDate(new Date(cost.date), 'dd/MM/yyyy')
                                : '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {cost.description}
                            </TableCell>
                            <TableCell className="capitalize">
                              <Badge
                                variant="secondary"
                                className="font-normal"
                              >
                                {t(`proj.budget.${cost.category}`) ||
                                  cost.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {cost.stageId
                                ? stages.find((s) => s.id === cost.stageId)
                                    ?.name || '-'
                                : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {cost.budgetItemId
                                ? budgetItemsList.find(
                                    (b) => b.id === cost.budgetItemId,
                                  )?.description || '-'
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(cost.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic bg-muted/10">
                    Nenhum custo alocado registrado ainda.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* CONTA CORRENTE TAB */}
          <TabsContent
            value="conta_corrente"
            className="space-y-8 animate-fade-in"
          >
            {/* Contas Bancárias Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Saldos & Contas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Visão geral de saldos disponíveis por conta.
                  </p>
                </div>
                <Dialog open={isAddAccOpen} onOpenChange={setIsAddAccOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Conta Corrente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Nome da Conta (Apelido)</Label>
                        <Input
                          placeholder="Ex: Conta Principal"
                          value={accData.name}
                          onChange={(e) =>
                            setAccData({ ...accData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Banco</Label>
                          <Input
                            placeholder="Ex: Itaú, Chase"
                            value={accData.bankName}
                            onChange={(e) =>
                              setAccData({
                                ...accData,
                                bankName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Agência</Label>
                          <Input
                            placeholder="0001"
                            value={accData.agency}
                            onChange={(e) =>
                              setAccData({ ...accData, agency: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Número da Conta</Label>
                        <Input
                          placeholder="12345-6"
                          value={accData.accountNumber}
                          onChange={(e) =>
                            setAccData({
                              ...accData,
                              accountNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Saldo Inicial</Label>
                        <CurrencyInput
                          value={accData.initialBalance}
                          onChange={(val) =>
                            setAccData({ ...accData, initialBalance: val })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddAccount}
                        disabled={!accData.name}
                      >
                        Salvar Conta
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {accountBalances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accountBalances.map((acc) => (
                    <Card key={acc.id} className="border-t-4 border-t-blue-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span className="truncate pr-2">{acc.name}</span>
                          <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400 text-xs font-medium whitespace-nowrap">
                            <Building2 className="h-3 w-3" /> {acc.bankName}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Ag: {acc.agency} / Cc: {acc.accountNumber}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold mb-4">
                          {formatCurrency(acc.currentBalance)}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground border-t pt-3 mt-2">
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <ArrowUpRight className="h-3 w-3" />{' '}
                            {formatCurrency(acc.ins)}
                          </span>
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                            <ArrowDownRight className="h-3 w-3" />{' '}
                            {formatCurrency(acc.outs)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 border border-dashed rounded-lg bg-muted/10">
                  <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">
                    Nenhuma conta corrente vinculada a este projeto.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t my-6 border-dashed" />

            {/* Extrato / Histórico Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Histórico de Movimentações
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Extrato detalhado, linkado ao cronograma e orçamento.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={filterAcc} onValueChange={setFilterAcc}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por Conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Contas</SelectItem>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.bankName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Dialog open={isAddMovOpen} onOpenChange={setIsAddMovOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Movimentação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Movimentação</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Conta Corrente</Label>
                          <Select
                            value={movData.accountId}
                            onValueChange={(val) =>
                              setMovData({ ...movData, accountId: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a conta" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Descrição</Label>
                            <Input
                              placeholder="Ex: Pagamento Fornecedor"
                              value={movData.description}
                              onChange={(e) =>
                                setMovData({
                                  ...movData,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Categoria</Label>
                            <Input
                              placeholder="Ex: Impostos, Materiais"
                              value={movData.category}
                              onChange={(e) =>
                                setMovData({
                                  ...movData,
                                  category: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* New link to Schedule/Budget */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Etapa do Cronograma</Label>
                            <Select
                              value={movData.stageId}
                              onValueChange={(val) =>
                                setMovData({ ...movData, stageId: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Opcional" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Geral (Nenhuma)
                                </SelectItem>
                                {stages.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Item do Orçamento</Label>
                            <Select
                              value={movData.budgetItemId}
                              onValueChange={(val) =>
                                setMovData({ ...movData, budgetItemId: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Opcional" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Geral (Nenhum)
                                </SelectItem>
                                {budgetItemsList.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Tipo</Label>
                            <Select
                              value={movData.type}
                              onValueChange={(val) =>
                                setMovData({ ...movData, type: val as any })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in">Entrada (+)</SelectItem>
                                <SelectItem value="out">Saída (-)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Valor</Label>
                            <CurrencyInput
                              value={movData.amount}
                              onChange={(val) =>
                                setMovData({ ...movData, amount: val })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Data</Label>
                          <Input
                            type="date"
                            value={movData.date}
                            onChange={(e) =>
                              setMovData({ ...movData, date: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleAddMovement}
                          disabled={!movData.accountId || !movData.amount}
                        >
                          Registrar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="border rounded-md bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Etapa Relacionada</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.length > 0 ? (
                      filteredMovements.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(new Date(mov.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{mov.description}</div>
                            {mov.category && (
                              <div className="text-[10px] text-muted-foreground">
                                {mov.category}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {mov.stageId
                              ? stages.find((s) => s.id === mov.stageId)
                                  ?.name || '-'
                              : '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {accounts.find((a) => a.id === mov.accountId)
                              ?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                mov.type === 'in'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                              }
                            >
                              {mov.type === 'in' ? 'Entrada' : 'Saída'}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${
                              mov.type === 'in'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {mov.type === 'in' ? '+' : '-'}
                            {formatCurrency(mov.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground italic"
                        >
                          Nenhuma movimentação financeira encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
