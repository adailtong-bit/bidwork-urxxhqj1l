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
  Loader2,
  Calendar as CalendarIcon,
  MapPin,
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
import { CurrencyInput } from '@/components/CurrencyInput'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function NewProject() {
  const navigate = useNavigate()
  const { addProject } = useProjectStore()
  const { toast } = useToast()
  const { formatDate } = useLanguageStore()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: addDays(new Date(), 180),
    totalBudget: 0,
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  })

  const handleAddressChange = (
    field: keyof typeof formData.address,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.address.city || !formData.address.state) {
      toast({
        variant: 'destructive',
        title: 'Campos Obrigatórios',
        description:
          'Por favor, preencha nome e os dados de endereço do projeto.',
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

    const formattedLocation = `${formData.address.city} - ${formData.address.state}`

    addProject({
      name: formData.name,
      description: formData.description,
      location: formattedLocation,
      address: formData.address,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalBudget: formData.totalBudget,
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
    <div className="space-y-6 max-w-3xl mx-auto py-8">
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
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Endereço da Obra</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    placeholder="00000-000"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      handleAddressChange('zipCode', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Logradouro (Rua, Av.)</Label>
                  <Input
                    id="street"
                    placeholder="Endereço"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleAddressChange('street', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="123"
                    value={formData.address.number}
                    onChange={(e) =>
                      handleAddressChange('number', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    placeholder="Apto, Bloco, etc."
                    value={formData.address.complement}
                    onChange={(e) =>
                      handleAddressChange('complement', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Bairro"
                    value={formData.address.neighborhood}
                    onChange={(e) =>
                      handleAddressChange('neighborhood', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange('city', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    maxLength={2}
                    value={formData.address.state}
                    onChange={(e) =>
                      handleAddressChange('state', e.target.value.toUpperCase())
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        formatDate(formData.startDate, 'PPP')
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
                        formatDate(formData.endDate, 'PPP')
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
              <Label htmlFor="budget">Orçamento Estimado Total</Label>
              <CurrencyInput
                id="budget"
                value={formData.totalBudget}
                onChange={(value) =>
                  setFormData({ ...formData, totalBudget: value })
                }
                placeholder="R$ 0,00"
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
