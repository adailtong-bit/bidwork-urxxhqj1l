import { useState } from 'react'
import {
  useAdminPricingStore,
  ConstructionPlan,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ManageConstructionPricing() {
  const { plans, addPlan, updatePlan, deletePlan } = useAdminPricingStore()
  const { toast } = useToast()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ConstructionPlan>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newPlan, setNewPlan] = useState<Partial<ConstructionPlan>>({
    name: '',
    description: '',
    maxProjects: 1,
    price: 0,
    complexity: 'Low',
    workSize: 'Até 100m²',
  })

  const handleSaveAdd = () => {
    if (!newPlan.name || !newPlan.price) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }
    addPlan(newPlan as Omit<ConstructionPlan, 'id'>)
    setIsAdding(false)
    setNewPlan({
      name: '',
      description: '',
      maxProjects: 1,
      price: 0,
      complexity: 'Low',
      workSize: 'Até 100m²',
    })
    toast({ title: 'Plano adicionado com sucesso!' })
  }

  const startEdit = (plan: ConstructionPlan) => {
    setEditingId(plan.id)
    setEditForm(plan)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      updatePlan(editingId, editForm)
      setEditingId(null)
      toast({ title: 'Plano atualizado com sucesso!' })
    }
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
          Gerenciar Planos de Obra
        </h1>
        <p className="text-muted-foreground">
          Configure os preços e limites para o módulo de Gestão de Obras.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos Disponíveis</CardTitle>
            <CardDescription>
              Estes planos serão exibidos na tela de checkout premium.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="mr-2 h-4 w-4" /> Novo Plano
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Complexidade</TableHead>
                <TableHead>Projetos (Max)</TableHead>
                <TableHead>Preço (R$)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow>
                  <TableCell>
                    <Input
                      value={newPlan.name}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, name: e.target.value })
                      }
                      placeholder="Nome do Plano"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newPlan.workSize}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, workSize: e.target.value })
                      }
                      placeholder="Ex: Até 200m²"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={newPlan.complexity}
                      onValueChange={(v: any) =>
                        setNewPlan({ ...newPlan, complexity: v })
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
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newPlan.maxProjects}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          maxProjects: Number(e.target.value),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newPlan.price}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600"
                      onClick={handleSaveAdd}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => setIsAdding(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  {editingId === plan.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editForm.workSize}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              workSize: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editForm.complexity}
                          onValueChange={(v: any) =>
                            setEditForm({ ...editForm, complexity: v })
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
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.maxProjects}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              maxProjects: Number(e.target.value),
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                          onClick={handleSaveEdit}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.workSize}</TableCell>
                      <TableCell>
                        {plan.complexity === 'Low'
                          ? 'Baixa'
                          : plan.complexity === 'Medium'
                            ? 'Média'
                            : 'Alta'}
                      </TableCell>
                      <TableCell>{plan.maxProjects}</TableCell>
                      <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(plan)}
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
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
