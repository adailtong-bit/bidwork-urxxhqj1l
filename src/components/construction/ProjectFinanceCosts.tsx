import { useState } from 'react'
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
import { CurrencyInput } from '@/components/CurrencyInput'
import { Plus, Trash2 } from 'lucide-react'

export function ProjectFinanceCosts({ projectId }: { projectId: string }) {
  const {
    getProject,
    addAllocatedCost,
    updateAllocatedCost,
    deleteAllocatedCost,
  } = useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const project = getProject(projectId)

  const [isAddCostOpen, setIsAddCostOpen] = useState(false)
  const [editingCostId, setEditingCostId] = useState<string | null>(null)
  const [costData, setCostData] = useState({
    description: '',
    category: 'material',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    stageId: 'none',
    budgetItemId: 'none',
  })

  if (!project) return null

  const allocated = project.allocatedCosts || []
  const stages = project.stages || []
  const budgetItemsList = project.budgetItems || []

  const handleOpenCostDialog = (cost?: any) => {
    if (cost) {
      setEditingCostId(cost.id)
      setCostData({
        description: cost.description,
        category: cost.category,
        amount: cost.amount,
        date: new Date(cost.date).toISOString().split('T')[0],
        stageId: cost.stageId || 'none',
        budgetItemId: cost.budgetItemId || 'none',
      })
    } else {
      setEditingCostId(null)
      setCostData({
        description: '',
        category: 'material',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        stageId: 'none',
        budgetItemId: 'none',
      })
    }
    setIsAddCostOpen(true)
  }

  const handleSaveCost = () => {
    const payload = {
      description: costData.description,
      category: costData.category as any,
      amount: costData.amount,
      type: 'actual' as const,
      date: new Date(costData.date + 'T12:00:00'),
      stageId: costData.stageId !== 'none' ? costData.stageId : undefined,
      budgetItemId:
        costData.budgetItemId !== 'none' ? costData.budgetItemId : undefined,
    }

    if (editingCostId) {
      updateAllocatedCost(projectId, editingCostId, payload)
    } else {
      addAllocatedCost(projectId, payload)
    }
    setIsAddCostOpen(false)
  }

  return (
    <div className="flex flex-col space-y-4 w-full animate-fade-in">
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Custos Alocados
          </h3>
          <p className="text-sm text-muted-foreground">
            Associe despesas às etapas do cronograma e itens do orçamento.
          </p>
        </div>
        <Dialog
          open={isAddCostOpen}
          onOpenChange={(open) => {
            if (!open) setEditingCostId(null)
            setIsAddCostOpen(open)
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenCostDialog()}>
              <Plus className="h-4 w-4 mr-2" /> Registrar Custo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCostId
                  ? 'Editar Custo Alocado'
                  : 'Registrar Custo Alocado'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Compra de cimento"
                  value={costData.description}
                  onChange={(e) =>
                    setCostData({ ...costData, description: e.target.value })
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
                      <SelectItem value="equipment">Equipamento</SelectItem>
                      <SelectItem value="logistics">Logística</SelectItem>
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
                    value={costData.budgetItemId}
                    onValueChange={(val) =>
                      setCostData({ ...costData, budgetItemId: val })
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
                onClick={handleSaveCost}
                disabled={!costData.description || !costData.amount}
              >
                Salvar Custo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-auto w-full max-h-[600px]">
          <Table className="min-w-[800px] w-full relative">
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Etapa Relacionada</TableHead>
                <TableHead>Item do Orçamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocated.length > 0 ? (
                allocated
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((cost) => (
                    <TableRow
                      key={cost.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleOpenCostDialog(cost)}
                    >
                      <TableCell className="text-muted-foreground text-sm">
                        {cost.date
                          ? formatDate(new Date(cost.date), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cost.description}
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="secondary" className="font-normal">
                          {t(`proj.budget.${cost.category}`) || cost.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {cost.stageId
                          ? stages.find((s) => s.id === cost.stageId)?.name ||
                            '-'
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
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteAllocatedCost(projectId, cost.id)
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
                    Nenhum custo alocado registrado ainda.
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
