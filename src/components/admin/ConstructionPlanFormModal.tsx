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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useAdminPricingStore,
  SubscriptionPlan,
} from '@/stores/useAdminPricingStore'
import { CurrencyInput } from '@/components/CurrencyInput'

export function ConstructionPlanFormModal({
  open,
  onClose,
  planToEdit,
}: {
  open: boolean
  onClose: () => void
  planToEdit: SubscriptionPlan | null
}) {
  const { addPlan, updatePlan } = useAdminPricingStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({})
  const [features, setFeatures] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      if (planToEdit) {
        setFormData({ ...planToEdit })
        setFeatures([...(planToEdit.features || [])])
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          billingCycle: 'monthly',
          maxProjects: 1,
          active: true,
        })
        setFeatures([''])
      }
    }
  }, [open, planToEdit])

  const handleSave = () => {
    if (
      !formData.name ||
      formData.price === undefined ||
      !formData.billingCycle ||
      !formData.maxProjects
    ) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }

    const cycleMap = {
      monthly: 30,
      quarterly: 90,
      'semi-annually': 180,
      yearly: 365,
    }
    const validity =
      cycleMap[formData.billingCycle as keyof typeof cycleMap] || 30

    const payload = {
      ...formData,
      targetAudience: 'contractor' as const,
      validityDays: validity,
      features: features.filter((f) => f.trim() !== ''),
    } as Omit<SubscriptionPlan, 'id'>

    if (planToEdit) {
      updatePlan(planToEdit.id, payload)
      toast({ title: 'Plano atualizado com sucesso!' })
    } else {
      addPlan(payload)
      toast({ title: 'Plano criado com sucesso!' })
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {planToEdit ? 'Editar Plano de Obras' : 'Novo Plano de Obras'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4 -mx-4">
          <div className="space-y-4 py-4 pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Select
                  value={formData.name || undefined}
                  onValueChange={(val: string) =>
                    setFormData({ ...formData, name: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nome do plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Prata">Prata</SelectItem>
                    <SelectItem value="Ouro">Ouro</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <CurrencyInput
                  value={formData.price || 0}
                  onChange={(val) => setFormData({ ...formData, price: val })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="semi-annually">Semestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Limite de Projetos Ativos</Label>
                <Input
                  type="number"
                  value={formData.maxProjects || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxProjects: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Benefícios Inclusos
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
                      onChange={(e) => {
                        const newF = [...features]
                        newF[idx] = e.target.value
                        setFeatures(newF)
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        setFeatures(features.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-lg">
              <Switch
                checked={formData.active ?? true}
                onCheckedChange={(val) =>
                  setFormData({ ...formData, active: val })
                }
              />
              <Label>Plano Ativo (Visível na loja)</Label>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Plano</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
