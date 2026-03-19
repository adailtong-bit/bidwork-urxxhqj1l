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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
          pushEnabled: false,
          priorityWeight: 1,
          complexity: 'Low',
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
        title: 'Preencha os campos obrigatórios na aba de Dados Básicos.',
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
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle>
              {planToEdit ? 'Editar Plano de Obras' : 'Novo Plano de Obras'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs
          defaultValue="basic"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="rules">Limites da Obra</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 h-full">
            <div className="px-6 py-4">
              <TabsContent value="basic" className="space-y-6 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Nome do Plano <span className="text-destructive">*</span>
                    </Label>
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
                    <Label>
                      Preço (R$) <span className="text-destructive">*</span>
                    </Label>
                    <CurrencyInput
                      value={formData.price || 0}
                      onChange={(val) =>
                        setFormData({ ...formData, price: val })
                      }
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

                <div className="space-y-2">
                  <Label>
                    Ciclo de Cobrança{' '}
                    <span className="text-destructive">*</span>
                  </Label>
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
                    {features.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhum benefício adicionado.
                      </p>
                    )}
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
              </TabsContent>

              <TabsContent value="rules" className="space-y-6 mt-0">
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h3 className="text-lg font-medium mb-1">
                    Limites e Prioridades da Construtora
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure restrições técnicas e privilégios de projeto
                    associados a este plano.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Limite de Projetos Ativos{' '}
                        <span className="text-destructive">*</span>
                      </Label>
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
                    <div className="space-y-2">
                      <Label>Peso de Prioridade na Plataforma</Label>
                      <Input
                        type="number"
                        value={formData.priorityWeight ?? 1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priorityWeight: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <Label>Nível de Complexidade de Obra Permitida</Label>
                    <Select
                      value={formData.complexity || 'Low'}
                      onValueChange={(val: any) =>
                        setFormData({ ...formData, complexity: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">
                          Baixa (Pequenas reformas)
                        </SelectItem>
                        <SelectItem value="Medium">
                          Média (Construções residenciais)
                        </SelectItem>
                        <SelectItem value="High">
                          Alta (Obras comerciais/industriais)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6 mt-0">
                <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                  <h3 className="text-lg font-medium mb-1">
                    Comunicações Automatizadas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure alertas push específicos para os contratantes
                    deste plano.
                  </p>

                  <div className="flex items-center space-x-2 border p-3 rounded-lg bg-background">
                    <Switch
                      id="pushEnabled"
                      checked={formData.pushEnabled ?? false}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, pushEnabled: checked })
                      }
                    />
                    <Label htmlFor="pushEnabled" className="cursor-pointer">
                      Habilitar Notificações Push Especiais
                    </Label>
                  </div>

                  {formData.pushEnabled && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Antecedência da Notificação (Horas)</Label>
                        <Input
                          type="number"
                          value={formData.pushLeadTimeHours ?? 24}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pushLeadTimeHours: Number(e.target.value),
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Tempo em horas para enviar alertas sobre milestones ou
                          faturamento de obras.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Texto da Notificação</Label>
                        <Textarea
                          value={formData.pushMessageText || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pushMessageText: e.target.value,
                            })
                          }
                          placeholder="Ex: Resumo do seu portfólio de obras disponível para análise."
                          className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Conteúdo que será enviado via Push Notification.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <div className="px-6 py-4 border-t bg-muted/10">
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Plano</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
