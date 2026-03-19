import { useState } from 'react'
import {
  useAdminPricingStore,
  SubscriptionPlan,
} from '@/stores/useAdminPricingStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ManagePlans() {
  const { plans, addPlan, updatePlan, deletePlan, togglePlanStatus } =
    useAdminPricingStore()
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({})
  const [features, setFeatures] = useState<string[]>([])

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id)
    setEditForm({ ...plan })
    setFeatures([...(plan.features || [])])
    setIsEditOpen(true)
  }

  const openAdd = () => {
    setEditingId(null)
    setEditForm({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
    })
    setFeatures([''])
    setIsEditOpen(true)
  }

  const saveEdit = () => {
    if (
      !editForm.name ||
      editForm.price === undefined ||
      !editForm.targetAudience ||
      !['executor', 'advertiser', 'contractor'].includes(
        editForm.targetAudience,
      ) ||
      !editForm.billingCycle ||
      !editForm.validityDays
    ) {
      toast({
        variant: 'destructive',
        title:
          'Preencha todos os campos obrigatórios, incluindo o público-alvo.',
      })
      return
    }

    const planData = {
      ...editForm,
      features: features.filter((f) => f.trim() !== ''),
    } as Omit<SubscriptionPlan, 'id'>

    if (editingId) {
      updatePlan(editingId, planData)
      toast({ title: 'Plano atualizado com sucesso!' })
    } else {
      addPlan(planData)
      toast({ title: 'Plano criado com sucesso!' })
    }
    setIsEditOpen(false)
  }

  const updateFeature = (idx: number, val: string) => {
    const newF = [...features]
    newF[idx] = val
    setFeatures(newF)
  }

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx))
  }

  const getAudienceLabel = (val: string) => {
    if (val === 'executor') return 'Executor'
    if (val === 'advertiser') return 'Anunciante'
    if (val === 'contractor') return 'Contratante'
    return val
  }

  const getCycleLabel = (val: string) => {
    if (val === 'monthly') return 'Mensal'
    if (val === 'quarterly') return 'Trimestral'
    if (val === 'semi-annually') return 'Semestral'
    if (val === 'yearly') return 'Anual'
    return val
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Planos</h1>
        <p className="text-muted-foreground">
          Crie e edite planos de assinatura para anunciantes, executores e
          contratantes.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos Cadastrados</CardTitle>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Novo Plano
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Plano</TableHead>
                <TableHead>Público-Alvo</TableHead>
                <TableHead>Preço / Ciclo</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className={!plan.active ? 'opacity-60' : ''}
                >
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getAudienceLabel(plan.targetAudience)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(plan.price)} (
                    {getCycleLabel(plan.billingCycle)})
                  </TableCell>
                  <TableCell>{plan.validityDays} dias</TableCell>
                  <TableCell>
                    <Switch
                      checked={plan.active}
                      onCheckedChange={() => togglePlanStatus(plan.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(plan)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Plano' : 'Criar Novo Plano'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-4 -mx-4">
            <div className="space-y-6 py-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Nome do Plano <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Ex: Premium Executor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Público-Alvo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={
                      editForm.targetAudience &&
                      ['executor', 'advertiser', 'contractor'].includes(
                        editForm.targetAudience,
                      )
                        ? editForm.targetAudience
                        : undefined
                    }
                    onValueChange={(val: any) =>
                      setEditForm({ ...editForm, targetAudience: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o público" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advertiser">Anunciante</SelectItem>
                      <SelectItem value="executor">Executor</SelectItem>
                      <SelectItem value="contractor">Contratante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={editForm.description || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Breve descrição..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>
                    Preço (R$) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={editForm.price ?? 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Ciclo de Cobrança{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editForm.billingCycle}
                    onValueChange={(val: any) =>
                      setEditForm({ ...editForm, billingCycle: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semi-annually">Semestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Validade (Dias) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={editForm.validityDays ?? 30}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        validityDays: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {editForm.targetAudience === 'contractor' && (
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label>Limite de Projetos</Label>
                    <Input
                      type="number"
                      value={editForm.maxProjects ?? 1}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          maxProjects: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Complexidade</Label>
                    <Select
                      value={editForm.complexity || 'Low'}
                      onValueChange={(val: any) =>
                        setEditForm({ ...editForm, complexity: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Baixa</SelectItem>
                        <SelectItem value="Medium">Média</SelectItem>
                        <SelectItem value="High">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  Benefícios / Funcionalidades
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFeatures([...features, ''])}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar
                  </Button>
                </Label>
                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={feat}
                        onChange={(e) => updateFeature(idx, e.target.value)}
                        placeholder="Ex: Anúncios ilimitados"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeFeature(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum benefício adicionado.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-lg">
                <Switch
                  id="active"
                  checked={editForm.active}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, active: checked })
                  }
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Plano Ativo (Visível para os usuários)
                </Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit}>Salvar Plano</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
