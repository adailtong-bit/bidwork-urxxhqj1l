import { useState, useMemo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { CurrencyInput } from '@/components/CurrencyInput'
import {
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProjectFinanceAccounts({ projectId }: { projectId: string }) {
  const {
    getProject,
    addCheckingAccount,
    addFinancialMovement,
    updateFinancialMovement,
    deleteFinancialMovement,
  } = useProjectStore()
  const { formatDate, formatCurrency } = useLanguageStore()
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
  const [editingMovId, setEditingMovId] = useState<string | null>(null)
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

  const [filterAcc, setFilterAcc] = useState('all')

  const accounts = project?.checkingAccounts || []
  const movements = project?.financialMovements || []
  const stages = project?.stages || []
  const budgetItemsList = project?.budgetItems || []

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

  const handleOpenMovDialog = (mov?: any) => {
    if (mov) {
      setEditingMovId(mov.id)
      setMovData({
        accountId: mov.accountId,
        description: mov.description,
        category: mov.category || 'Geral',
        amount: mov.amount,
        type: mov.type,
        date: new Date(mov.date).toISOString().split('T')[0],
        stageId: mov.stageId || 'none',
        budgetItemId: mov.budgetItemId || 'none',
      })
    } else {
      setEditingMovId(null)
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
    setIsAddMovOpen(true)
  }

  const handleSaveMovement = () => {
    const payload = {
      accountId: movData.accountId,
      description: movData.description,
      category: movData.category || 'Geral',
      amount: movData.amount,
      type: movData.type as 'in' | 'out',
      date: new Date(movData.date + 'T12:00:00'),
      stageId: movData.stageId !== 'none' ? movData.stageId : undefined,
      budgetItemId:
        movData.budgetItemId !== 'none' ? movData.budgetItemId : undefined,
    }

    if (editingMovId) {
      updateFinancialMovement(projectId, editingMovId, payload)
    } else {
      addFinancialMovement(projectId, payload)
    }
    setIsAddMovOpen(false)
  }

  return (
    <div className="flex flex-col h-[75vh] min-h-[600px] w-full min-w-0 space-y-6 animate-fade-in">
      <div className="shrink-0 space-y-4">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
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
                      setAccData({ ...accData, accountNumber: e.target.value })
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
          <div className="text-center p-6 border border-dashed rounded-lg bg-muted/10">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">
              Nenhuma conta corrente vinculada a este projeto.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
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

            <Dialog
              open={isAddMovOpen}
              onOpenChange={(open) => {
                if (!open) setEditingMovId(null)
                setIsAddMovOpen(open)
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => handleOpenMovDialog()}>
                  <Plus className="h-4 w-4 mr-2" /> Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMovId
                      ? 'Editar Movimentação'
                      : 'Registrar Movimentação'}
                  </DialogTitle>
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
                          setMovData({ ...movData, category: e.target.value })
                        }
                      />
                    </div>
                  </div>

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
                          <SelectItem value="none">Geral (Nenhuma)</SelectItem>
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
                          <SelectItem value="none">Geral (Nenhum)</SelectItem>
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
                    onClick={handleSaveMovement}
                    disabled={!movData.accountId || !movData.amount}
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-xl bg-card shadow-sm relative">
          <Table className="min-w-[800px] w-full">
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Etapa Relacionada</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length > 0 ? (
                filteredMovements.map((mov) => (
                  <TableRow
                    key={mov.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleOpenMovDialog(mov)}
                  >
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
                        ? stages.find((s) => s.id === mov.stageId)?.name || '-'
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {accounts.find((a) => a.id === mov.accountId)?.name ||
                        '-'}
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
                        mov.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {mov.type === 'in' ? '+' : '-'}
                      {formatCurrency(mov.amount)}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          deleteFinancialMovement(projectId, mov.id)
                        }
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground italic"
                  >
                    Nenhuma movimentação financeira encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
