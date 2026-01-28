import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useProjectStore,
  DEFAULT_STAGES_TEMPLATE,
  Stage,
} from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Save,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function NewProject() {
  const navigate = useNavigate()
  const { addProject } = useProjectStore()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: new Date(),
    endDate: addDays(new Date(), 180),
    totalBudget: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.location) {
      toast({
        variant: 'destructive',
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha nome e localização do projeto.',
      })
      return
    }

    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create 11 stages based on template
    const stages: Stage[] = DEFAULT_STAGES_TEMPLATE.map((t, idx) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: t.name,
      description: t.description,
      status: idx === 0 ? 'in_progress' : 'pending',
      startDate: addDays(formData.startDate, idx * 30),
      endDate: addDays(formData.startDate, (idx + 1) * 30),
      budgetMaterial: 0,
      budgetLabor: 0,
      actualMaterial: 0,
      actualLabor: 0,
      bimFiles: [],
    }))

    addProject({
      ...formData,
      ownerId: 'current-user-id', // Mock ID
      status: 'planning',
      stages,
    })

    setLoading(false)
    toast({
      title: 'Projeto Iniciado!',
      description: 'Estrutura de 11 etapas criada com sucesso.',
    })
    navigate('/construction/dashboard')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Novo Projeto de Obra
          </h1>
          <p className="text-muted-foreground">
            Inicialize o fluxo de construção completo (11 Etapas).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Principais</CardTitle>
          <CardDescription>
            Defina as informações base para o gerenciamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                placeholder="Ex: Residencial Flores"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Cidade, Estado"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, startDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Previsão de Término</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, endDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento Estimado Total (R$)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="0.00"
                value={formData.totalBudget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalBudget: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea
                id="desc"
                placeholder="Detalhes do empreendimento..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <Label className="font-semibold">
                Workflow Padrão (11 Etapas)
              </Label>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {DEFAULT_STAGES_TEMPLATE.slice(0, 5).map((s, i) => (
                  <li key={i}>{s.name}</li>
                ))}
                <li>... e mais {DEFAULT_STAGES_TEMPLATE.length - 5} etapas.</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Projeto
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
