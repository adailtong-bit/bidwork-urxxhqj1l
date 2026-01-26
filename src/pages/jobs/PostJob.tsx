import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar as CalendarIcon,
  Gavel,
  Tag,
  MapPin,
  DollarSign,
  Clock,
  Zap,
  Upload,
  Image as ImageIcon,
  X,
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
  premiumType: z.enum(['none', 'region', 'category']),
})

type JobForm = z.infer<typeof jobSchema>

export default function PostJob() {
  const { addJob, hasActiveJob } = useJobStore()
  const { user } = useAuthStore()
  const { categories } = useCategoryStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [photos, setPhotos] = useState<string[]>([])
  const [photoInput, setPhotoInput] = useState('')

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
      premiumType: 'none',
    },
  })

  // Strict check for previous jobs being finished/finalized
  if (user && hasActiveJob(user.id)) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              Ação Bloqueada: Job Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Detectamos que você possui um Job em andamento ou não finalizado.
              Para garantir a qualidade da plataforma, você deve concluir ou
              cancelar seus processos atuais antes de abrir novos chamados.
            </p>
            <Button variant="outline" onClick={() => navigate('/my-jobs')}>
              Ir para Meus Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddPhoto = () => {
    // Mock upload by accepting image URLs or placeholder
    const url =
      photoInput ||
      `https://img.usecurling.com/p/300/200?q=service&r=${Math.random()}`
    setPhotos([...photos, url])
    setPhotoInput('')
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
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
      photos,
      type: data.type,
      category: data.category,
      location: data.location,
      budget: data.budget,
      ownerId: user.id,
      ownerName: user.name,
      publicationDate: data.publicationDate,
      auctionEndDate: data.auctionEndDate,
      maxExecutionDeadline: data.maxExecutionDeadline,
      premiumType: data.premiumType,
    })

    toast({
      title: 'Job Publicado com Sucesso!',
      description:
        'Notificando executores relevantes agora. Se ninguém aceitar em 24h, expandiremos para a região.',
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

              <div className="space-y-2">
                <FormLabel>Fotos do Local/Serviço (Opcional)</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Cole uma URL de imagem ou clique para adicionar mock"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPhoto}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Adicionar
                  </Button>
                </div>
                {photos.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative group shrink-0">
                        <img
                          src={photo}
                          alt="Job preview"
                          className="w-24 h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
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
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full">
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
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full">
                            <Gavel className="mb-3 h-6 w-6" />
                            <span className="font-semibold">
                              Leilão Reverso
                            </span>
                            <span className="text-xs text-muted-foreground mt-1 text-center">
                              Executores ofertam lances menores.
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
                          ? 'Preço Máximo Inicial'
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
                      <FormDescription>
                        {form.watch('type') === 'auction'
                          ? 'Executores darão lances menores que este valor.'
                          : 'Valor fixo que você pagará pelo serviço.'}
                      </FormDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Visibilidade e Destaque</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="premiumType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="none"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer relative overflow-hidden h-full">
                            <span className="font-semibold">Gratuito</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              Visibilidade por proximidade
                            </span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="region"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer relative overflow-hidden h-full">
                            <Zap className="mb-2 h-5 w-5 text-blue-500" />
                            <span className="font-semibold text-center">
                              Superior na Região
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              +R$ 19,90
                            </span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="category"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer relative overflow-hidden h-full">
                            <Zap className="mb-2 h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-center">
                              Superior na Categoria
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              +R$ 39,90
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
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
