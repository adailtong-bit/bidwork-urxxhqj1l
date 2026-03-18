import { useState } from 'react'
import {
  useAdminPricingStore,
  SubscriptionPlan,
} from '@/stores/useAdminPricingStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ManageConstructionPricing() {
  const { plans, addPlan, updatePlan, deletePlan } = useAdminPricingStore()
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({
    name: '',
    price: 0,
    features: [],
  })

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id)
    setEditForm({ ...plan })
    setIsEditOpen(true)
  }

  const saveEdit = () => {
    if (editingId) {
      updatePlan(editingId, editForm)
      toast({ title: 'Plano atualizado com sucesso!' })
    } else {
      addPlan(editForm as Omit<SubscriptionPlan, 'id'>)
      toast({ title: 'Plano criado com sucesso!' })
    }
    setIsEditOpen(false)
  }

  const openAdd = () => {
    setEditingId(null)
    setEditForm({ name: '', price: 0, features: [], description: '' })
    setIsEditOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este plano?')) {
      deletePlan(id)
      toast({ title: 'Plano excluído.' })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin: Planos de Assinatura
        </h1>
        <p className="text-muted-foreground">
          Gerencie os planos e preços oferecidos aos usuários na plataforma.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos Disponíveis</CardTitle>
            <CardDescription>
              Ajuste as características e valores dos planos de assinatura.
            </CardDescription>
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
                <TableHead>Preço Mensal</TableHead>
                <TableHead>Features (Quantidade)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{formatCurrency(plan.price)}</TableCell>
                  <TableCell>{plan.features?.length || 0} features</TableCell>
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
                      onClick={() => handleDelete(plan.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Plano' : 'Criar Novo Plano'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Ex: Pro, Enterprise..."
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Breve descrição do plano..."
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Mensal (R$)</Label>
              <Input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: Number(e.target.value) })
                }
                placeholder="Ex: 49.90"
              />
            </div>
            <div className="space-y-2">
              <Label>Funcionalidades (Uma por linha)</Label>
              <Textarea
                value={editForm.features?.join('\n')}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    features: e.target.value.split('\n').filter(Boolean),
                  })
                }
                placeholder="Suporte VIP&#10;Taxa de 5%&#10;Relatórios"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
