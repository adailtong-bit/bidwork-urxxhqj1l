import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SubscriptionPlan,
  useAdminPricingStore,
} from '@/stores/useAdminPricingStore'
import { Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConstructionPlanFormModalProps {
  open: boolean
  onClose: () => void
  planToEdit?: SubscriptionPlan | null
}

export function ConstructionPlanFormModal({
  open,
  onClose,
  planToEdit,
}: ConstructionPlanFormModalProps) {
  const { addPlan, updatePlan } = useAdminPricingStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    validityDays: 30,
    active: true,
    targetAudience: 'contractor',
    maxProjects: 1,
    complexity: 'Low',
    workSize: '',
    features: [''],
  })

  useEffect(() => {
    if (planToEdit) {
      setFormData({ ...planToEdit })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        billingCycle: 'monthly',
        validityDays: 30,
        active: true,
        targetAudience: 'contractor',
        maxProjects: 1,
        complexity: 'Low',
        workSize: '',
        features: [''],
      })
    }
  }, [planToEdit, open])

  const handleSave = () => {
    if (!formData.name || formData.price === undefined) {
      toast({
        variant: 'destructive',
        title: 'Preencha o nome e preço do plano.',
      })
      return
    }

    const planData = {
      ...formData,
      features: (formData.features || []).filter((f) => f.trim() !== ''),
    } as Omit<SubscriptionPlan, 'id'>

    if (planToEdit) {
      updatePlan(planToEdit.id, planData)
      toast({ title: 'Plano atualizado com sucesso!' })
    } else {
      addPlan(planData)
      toast({ title: 'Plano criado com sucesso!' })
    }
    onClose()
  }

  const updateFeature = (idx: number, val: string) => {
    const newF = [...(formData.features || [])]
    newF[idx] = val
    setFormData({ ...formData, features: newF })
  }

  const removeFeature = (idx: number) => {
    const newF = [...(formData.features || [])]
    newF.splice(idx, 1)
    setFormData({ ...formData, features: newF })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {planToEdit ? 'Editar Plano de Obras' : 'Novo Plano de Obras'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Plano</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição Curta</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço Base (R$)</Label>
              <Input
                type="number"
                value={formData.price ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Ciclo de Cobrança</Label>
              <Select
                value={formData.billingCycle}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, billingCycle: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Limite de Projetos</Label>
              <Input
                type="number"
                value={formData.maxProjects ?? 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxProjects: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Complexidade do Módulo</Label>
              <Select
                value={formData.complexity}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, complexity: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Baixa (Reformas Simples)</SelectItem>
                  <SelectItem value="Medium">
                    Média (Casas/Pequenos Prédios)
                  </SelectItem>
                  <SelectItem value="High">
                    Alta (Grandes Projetos/Enterprise)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamanho do Escopo (Ex: Até 500m²)</Label>
              <Input
                value={formData.workSize || ''}
                onChange={(e) =>
                  setFormData({ ...formData, workSize: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center justify-between">
              Benefícios e Funcionalidades (Exibidos no Checkout)
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData({
                    ...formData,
                    features: [...(formData.features || []), ''],
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </Label>
            <div className="space-y-2">
              {(formData.features || []).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={feat}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder="Ex: Assinatura Eletrônica Ilimitada"
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
            </div>
          </div>

          <div className="flex items-center space-x-2 border p-3 rounded-lg">
            <Switch
              id="active-plan"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
            <Label htmlFor="active-plan" className="cursor-pointer">
              Disponível para Compra
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Plano</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
