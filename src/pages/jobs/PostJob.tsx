import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useProjectStore } from '@/stores/useProjectStore'
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
  X,
  HardHat,
  Image as ImageIcon,
  Loader2,
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
  subCategory: z.string().min(1, 'Selecione uma sub-categoria'),
  // Address Fields
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().min(3, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF inválido'),
  // Budget & Dates
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
  projectId: z.string().optional(),
  stageId: z.string().optional(),
})

type JobForm = z.infer<typeof jobSchema>

export default function PostJob() {
  const { addJob, hasActiveJob } = useJobStore()
  const { user } = useAuthStore()
  const { categories } = useCategoryStore()
  const { projects, updateStageActuals } = useProjectStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const [photos, setPhotos] = useState<string[]>([])
  const [photoInput, setPhotoInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const preProjectId = searchParams.get('projectId') || ''
  const preStageId = searchParams.get('stageId') || ''

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'fixed',
      category: '',
      subCategory: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: user?.location?.split(' - ')[0] || '',
      state: user?.location?.split(' - ')[1] || '',
      budget: 0,
      publicationDate: new Date(),
      premiumType: 'none',
      projectId: preProjectId,
      stageId: preStageId,
    },
  })

  // Watch fields
  const selectedProjectId = form.watch('projectId')
  const selectedCategory = form.watch('category')

  const availableStages =
    projects.find((p) => p.id === selectedProjectId)?.stages || []

  const currentCategory = categories.find((c) => c.name === selectedCategory)
  const availableSubCategories = currentCategory?.subCategories || []

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

  const handleAddPhotoLink = () => {
    if (!photoInput) return
    setPhotos([...photos, photoInput])
    setPhotoInput('')
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    // Simulate upload delay
    setTimeout(() => {
      const newPhotos = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      )
      setPhotos((prev) => [...prev, ...newPhotos])
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }, 1000)
  }

  const onSubmit = (data: JobForm) => {
    if (!user) return

    if (data.type === 'auction' && !data.auctionEndDate) {
      form.setError('auctionEndDate', {
        message: 'Data de fim do leilão obrigatória',
      })
      return
    }

    const fullLocation = `${data.city} - ${data.state}`

    addJob({
      title: data.title,
      description: data.description,
      photos,
      type: data.type,
      category: data.category,
      subCategory: data.subCategory,
      location: fullLocation,
      address: {
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      },
      budget: data.budget,
      ownerId: user.id,
      ownerName: user.name,
      publicationDate: data.publicationDate,
      auctionEndDate: data.auctionEndDate,
      maxExecutionDeadline: data.maxExecutionDeadline,
      premiumType: data.premiumType,
      projectId: data.projectId,
      stageId: data.stageId,
      regionCode: data.state,
    })

    if (data.projectId && data.stageId && data.type === 'fixed') {
      updateStageActuals(data.projectId, data.stageId, 'labor', data.budget)
    }

    toast({
      title: 'Job Publicado com Sucesso!',
      description: 'Notificando executores relevantes agora.',
    })

    if (data.projectId) {
      navigate(`/construction/projects/${data.projectId}`)
    } else {
      navigate('/my-jobs')
    }
  }

  const isConstrutora = user?.entityType === 'pj'

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Publicar Novo Job</h1>
        <p className="text-muted-foreground">
          Preencha os detalhes para encontrar o profissional ideal.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Construction/Project Context */}
          {isConstrutora && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardHat className="h-5 w-5" /> Vínculo com Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projeto (Opcional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o projeto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etapa da Obra</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedProjectId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a etapa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableStages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
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

              {/* Categorization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria Principal</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val)
                          form.setValue('subCategory', '') // Reset subcategory
                        }}
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
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={
                          !selectedCategory || !availableSubCategories.length
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo específico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSubCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.name}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Deadline */}
              <FormField
                control={form.control}
                name="maxExecutionDeadline"
                render={({ field }) => (
                  <FormItem className="pt-2">
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

          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos e Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Upload de Imagens</FormLabel>
                <div className="flex gap-4 items-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full md:w-auto"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ImageIcon className="h-4 w-4 mr-2" />
                    )}
                    Selecionar Arquivos
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    JPG, PNG ou GIF. Max 5MB.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Ou adicione por Link</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPhotoLink}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Adicionar Link
                  </Button>
                </div>
              </div>

              {photos.length > 0 && (
                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group shrink-0">
                      <img
                        src={photo}
                        alt="Job preview"
                        className="w-32 h-32 object-cover rounded-md border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço do Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado (UF)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SP"
                          maxLength={2}
                          className="uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, Bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget and Type */}
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
                          ? 'Valor teto. Executores só poderão dar lances MENORES que este.'
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

          {/* Premium Options */}
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

          <div className="flex justify-end gap-4 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 border-t z-10">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={!form.formState.isValid}>
              Publicar Job
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
