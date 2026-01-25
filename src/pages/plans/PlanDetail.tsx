import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlanStore, Plan } from '@/stores/usePlanStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarIcon,
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plans, addPlan, updatePlan, deletePlan } = usePlanStore()
  const { toast } = useToast()

  const isNew = id === 'new' || id === undefined
  const [formData, setFormData] = useState<Partial<Plan>>({
    title: '',
    description: '',
    status: 'Planejamento',
    category: 'Marketing',
    progress: 0,
    budget: 0,
    owner: 'Eu',
    deadline: new Date(),
  })

  useEffect(() => {
    if (!isNew && id) {
      const plan = plans.find((p) => p.id === id)
      if (plan) {
        setFormData(plan)
      } else {
        toast({
          title: 'Erro',
          description: 'Plano não encontrado',
          variant: 'destructive',
        })
        navigate('/plans')
      }
    }
  }, [id, plans, isNew, navigate, toast])

  const handleSave = () => {
    if (!formData.title) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório',
        variant: 'destructive',
      })
      return
    }

    try {
      if (isNew) {
        addPlan(formData as Omit<Plan, 'id' | 'createdAt'>)
        toast({ title: 'Sucesso', description: 'Plano criado com sucesso!' })
      } else {
        if (id) updatePlan(id, formData)
        toast({
          title: 'Sucesso',
          description: 'Plano atualizado com sucesso!',
        })
      }
      navigate('/plans')
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar o plano',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = () => {
    if (id && confirm('Tem certeza que deseja excluir este plano?')) {
      deletePlan(id)
      toast({ title: 'Deletado', description: 'Plano removido com sucesso.' })
      navigate('/plans')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/plans')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? 'Criar Novo Plano' : 'Editar Plano'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Salvar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Informações Gerais
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Metas
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Equipe
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Orçamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Plano</CardTitle>
              <CardDescription>
                Informações básicas sobre o planejamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título do Plano</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Lançamento Q4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val: any) =>
                      setFormData({ ...formData, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Desenvolvimento">
                        Desenvolvimento
                      </SelectItem>
                      <SelectItem value="RH">RH</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val: any) =>
                      setFormData({ ...formData, status: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planejamento">Planejamento</SelectItem>
                      <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                      <SelectItem value="Atrasado">Atrasado</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Prazo Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !formData.deadline && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? (
                        format(formData.deadline, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.deadline}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          deadline: date || new Date(),
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o objetivo deste plano..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Metas e Objetivos</CardTitle>
              <CardDescription>
                Defina os principais resultados chave (OKRs) para este plano.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <CheckCircle2 className="h-10 w-10 mb-4 opacity-20" />
                <p>Funcionalidade de gestão de metas em desenvolvimento.</p>
                <Button variant="outline" className="mt-4">
                  Adicionar Meta (Mock)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipe Envolvida</CardTitle>
              <CardDescription>
                Gerencie quem tem acesso e responsabilidades neste plano.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Em breve você poderá convidar membros.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Orçamento</CardTitle>
              <CardDescription>Controle financeiro do projeto.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-w-sm">
                <Label htmlFor="budget">Orçamento Total (R$)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: Number(e.target.value) })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
