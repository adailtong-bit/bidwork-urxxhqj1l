import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Calendar as CalendarIcon,
  Gavel,
  Tag,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const jobSchema = z.object({
  title: z.string().min(5, 'Título muito curto'),
  description: z.string().min(20, 'Descreva melhor o serviço'),
  type: z.enum(['fixed', 'auction']),
  category: z.string().min(1, 'Selecione uma categoria'),
  location: z.string().min(3, 'Localização é obrigatória'),
  budget: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Valor deve ser maior que zero'),
  auctionEndDate: z.date().optional(),
  maxExecutionDeadline: z.date({
    required_error: 'Prazo máximo é obrigatório',
  }),
  publicationDate: z.date().default(new Date()),
})

type JobForm = z.infer<typeof jobSchema>

export default function PostJob() {
  const { addJob, hasActiveJob } = useJobStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'fixed',
      category: '',
      location: user?.location || '',
      budget: 0,
      publicationDate: new Date(),
    },
  })

  // Restriction Check
  if (user && hasActiveJob(user.id)) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> Ação Bloqueada
            </CardTitle>
            <CardDescription className="text-destructive font-medium">
              Você possui um Job Ativo pendente de finalização ou avaliação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Para garantir a qualidade da plataforma, finalize seus processos
              atuais antes de abrir novos chamados.
            </p>
            <Button variant="outline" onClick={() => navigate('/my-jobs')}>
              Ir para Meus Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSubmit = (data: JobForm) => {
    if (!user) return

    if (data.type === 'auction' && !data.auctionEndDate) {
      form.setError('auctionEndDate', {
        message: 'Data de fim do leilão obrigatória',
      })
      return
    }

    addJob({
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      location: data.location,
      budget: data.budget,
      ownerId: user.id,
      ownerName: user.name,
      publicationDate: data.publicationDate,
      auctionEndDate: data.auctionEndDate,
      maxExecutionDeadline: data.maxExecutionDeadline,
      isPremiumVisibility: user.isPremium,
    })

    toast({
      title: 'Job Publicado!',
      description:
        'Seu serviço já está disponível. Notificando executores relevantes...',
    })
    navigate('/my-jobs')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Publicar Novo Job</h1>
        <p className="text-muted-foreground">
          Preencha os detalhes para encontrar o profissional ideal.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Projeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Reforma do Banheiro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o escopo, materiais necessários, prazos, etc."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TI e Programação">
                            TI e Programação
                          </SelectItem>
                          <SelectItem value="Reformas">Reformas</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Serviços Domésticos">
                            Serviços Domésticos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="Cidade/Estado"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="maxExecutionDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo Máximo de Execução</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Data limite para o serviço estar concluído.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modelo de Contratação e Valor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Acordo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="fixed"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <Tag className="mb-3 h-6 w-6" />
                            <span className="font-semibold">Preço Fixo</span>
                            <span className="text-xs text-muted-foreground mt-1 text-center">
                              Valor fechado e definido.
                            </span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="auction"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <Gavel className="mb-3 h-6 w-6" />
                            <span className="font-semibold">
                              Leilão (Bidding)
                            </span>
                            <span className="text-xs text-muted-foreground mt-1 text-center">
                              Executores competem com lances.
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('type') === 'auction'
                          ? 'Valor Máximo Inicial'
                          : 'Valor Ofertado'}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            type="number"
                            placeholder="0.00"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('type') === 'auction' && (
                  <FormField
                    control={form.control}
                    name="auctionEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim do Leilão</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <Clock className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg">
              Publicar Job
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
