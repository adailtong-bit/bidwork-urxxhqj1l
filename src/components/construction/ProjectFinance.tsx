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
import { CurrencyInput } from '@/components/CurrencyInput'
import {
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react'

export function ProjectFinance({ projectId }: { projectId: string }) {
  const { getProject, addCheckingAccount, addFinancialMovement } =
    useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const project = getProject(projectId)

  const [isAddAccOpen, setIsAddAccOpen] = useState(false)
  const [accData, setAccData] = useState({
    name: '',
    bankName: '',
    agency: '',
    accountNumber: '',
    initialBalance: 0,
  })

  const [isAddMovOpen, setIsAddMovOpen] = useState(false)
  const [movData, setMovData] = useState({
    accountId: '',
    description: '',
    amount: 0,
    type: 'out',
    date: '',
  })

  const [filterAcc, setFilterAcc] = useState('all')

  if (!project) return null

  const accounts = project.checkingAccounts || []
  const movements = project.financialMovements || []
  const allocated = project.allocatedCosts || []

  const realTotalSpent =
    project.totalSpent + allocated.reduce((acc, c) => acc + c.amount, 0)

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
    if (filterAcc === 'all') return movements
    return movements.filter((m) => m.accountId === filterAcc)
  }, [movements, filterAcc])

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
      amount: movData.amount,
      type: movData.type as 'in' | 'out',
      date: movData.date ? new Date(movData.date) : new Date(),
    })
    setIsAddMovOpen(false)
    setMovData({
      accountId: '',
      description: '',
      amount: 0,
      type: 'out',
      date: '',
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financeiro & Conta Corrente</CardTitle>
        <CardDescription>
          Gerencie as contas bancárias, movimentações e o resumo orçamentário do
          projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contas">
          <TabsList className="mb-6">
            <TabsTrigger value="contas">Conta Corrente</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="resumo">Resumo Orçamentário</TabsTrigger>
          </TabsList>

          <TabsContent value="contas" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddAccOpen} onOpenChange={setIsAddAccOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Nova Conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Conta Corrente</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Nome da Conta</Label>
                      <Input
                        placeholder="Ex: Conta Principal da Obra"
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
                          placeholder="Ex: Itaú"
                          value={accData.bankName}
                          onChange={(e) =>
                            setAccData({ ...accData, bankName: e.target.value })
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
                    <Button onClick={handleAddAccount} disabled={!accData.name}>
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
                      <CardTitle className="text-lg flex justify-between">
                        <span className="flex items-center gap-2 text-blue-700">
                          <Building2 className="h-4 w-4" /> {acc.bankName}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {acc.name} • {acc.agency} / {acc.accountNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">
                        {formatCurrency(acc.currentBalance)}
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground border-t pt-2 mt-2">
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <ArrowUpRight className="h-3 w-3" />{' '}
                          {formatCurrency(acc.ins)}
                        </span>
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <ArrowDownRight className="h-3 w-3" />{' '}
                          {formatCurrency(acc.outs)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
                <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  Nenhuma conta corrente vinculada a este projeto.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="movimentacoes" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Select value={filterAcc} onValueChange={setFilterAcc}>
                <SelectTrigger className="w-full sm:w-[300px]">
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
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Nova Movimentação
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
                    <div className="grid gap-2">
                      <Label>Descrição</Label>
                      <Input
                        value={movData.description}
                        onChange={(e) =>
                          setMovData({
                            ...movData,
                            description: e.target.value,
                          })
                        }
                      />
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

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.length > 0 ? (
                    filteredMovements.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {formatDate(new Date(mov.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {mov.description}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {accounts.find((a) => a.id === mov.accountId)?.name ||
                            '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              mov.type === 'in'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                            }
                          >
                            {mov.type === 'in' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${
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
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground italic"
                      >
                        Nenhuma movimentação encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="resumo" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium">
                  {t('proj.finance.inflow')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">
                    {formatCurrency(project.totalBudget)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('proj.finance.approved_budget')}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm text-red-800 font-medium">
                  {t('proj.finance.outflow')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-700">
                    {formatCurrency(realTotalSpent)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('proj.finance.costs_allocated')}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 font-medium">
                  {t('proj.finance.balance')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-700">
                    {formatCurrency(project.totalBudget - realTotalSpent)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('proj.finance.available')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                {t('proj.finance.allocated_costs')}
              </h3>
              <div className="border rounded-md">
                {allocated.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>{t('finance.description')}</TableHead>
                        <TableHead>{t('market.category')}</TableHead>
                        <TableHead className="text-right">
                          {t('dashboard.chart.label.value')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocated.map((cost) => (
                        <TableRow key={cost.id}>
                          <TableCell>{cost.description}</TableCell>
                          <TableCell className="capitalize">
                            {t(`proj.budget.${cost.category}`)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(cost.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic">
                    {t('proj.finance.no_allocated')}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
