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
  Clock,
  Zap,
  Upload,
  X,
  HardHat,
  Image as ImageIcon,
  Loader2,
  Phone,
  Link as LinkIcon,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn, maskPhone, maskZip } from '@/lib/utils'
import { format } from 'date-fns'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CurrencyInput } from '@/components/CurrencyInput'
import { getCountryValidation } from '@/lib/validation'
import { PremiumConstructionModal } from '@/components/PremiumConstructionModal'

export default function PostJob() {
  const { addJob } = useJobStore()
  const { user } = useAuthStore()
  const { categories } = useCategoryStore()
  const { projects, updateStageActuals } = useProjectStore()
  const { t, getDateLocale, currentLanguage } = useLanguageStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const [photos, setPhotos] = useState<string[]>([])
  const [photoInput, setPhotoInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const preProjectId = searchParams.get('projectId') || ''
  const preStageId = searchParams.get('stageId') || ''
  const typeParam = searchParams.get('type') || 'job'

  const [linkToProject, setLinkToProject] = useState(!!preProjectId)
  const [openProject, setOpenProject] = useState(false)
  const [openStage, setOpenStage] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const isSubscribed = user?.constructionSubscription?.active

  // Determine country for validation
  const country = (user?.address?.country as 'BR' | 'US') || 'BR'
  const { phone: phoneValidation, zip: zipValidation } =
    getCountryValidation(country)

  const jobSchema = z.object({
    title: z.string().min(5, t('val.title_required')),
    description: z.string().min(20, t('val.required')),
    type: z.enum(['fixed', 'auction']),
    category: z.string().min(1, t('val.required')),
    subCategory: z.string().min(1, t('val.required')),
    contactPhone: phoneValidation,
    // Address Fields
    zipCode: zipValidation,
    street: z.string().min(3, t('val.required')),
    number: z.string().min(1, t('val.required')),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, t('val.required')),
    city: z.string().min(2, t('val.required')),
    state: z.string().length(2, t('val.required')),
    // Budget & Dates
    budget: z
      .number({ required_error: t('val.required') })
      .refine((val) => val >= 0, t('val.required')),
    auctionEndDate: z.date().optional(),
    maxExecutionDeadline: z.date({
      required_error: t('val.required'),
    }),
    publicationDate: z.date().default(new Date()),
    premiumType: z.enum(['none', 'region', 'category']),
    projectId: z.string().optional(),
    stageId: z.string().optional(),
  })

  type JobForm = z.infer<typeof jobSchema>

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'fixed',
      category: '',
      subCategory: '',
      contactPhone: user?.phone || '',
      zipCode: user?.address?.zipCode || '',
      street: user?.address?.street || '',
      number: user?.address?.number || '',
      complement: user?.address?.complement || '',
      neighborhood: user?.address?.neighborhood || '',
      city: user?.location?.split(' - ')[0] || user?.address?.city || '',
      state: user?.location?.split(' - ')[1] || user?.address?.state || '',
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

  const handleToggleLink = (checked: boolean) => {
    if (checked && !isSubscribed) {
      setShowPremiumModal(true)
      return
    }
    setLinkToProject(checked)
    if (!checked) {
      form.setValue('projectId', '')
      form.setValue('stageId', '')
    }
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
        message: t('val.required'),
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
      projectId: linkToProject ? data.projectId || undefined : undefined,
      stageId: linkToProject ? data.stageId || undefined : undefined,
      regionCode: data.state,
      contactPhone: data.contactPhone,
      listingType: typeParam, // 'job', 'product', 'rental', 'community'
    })

    if (
      linkToProject &&
      data.projectId &&
      data.stageId &&
      data.type === 'fixed'
    ) {
      updateStageActuals(data.projectId, data.stageId, 'labor', data.budget)
    }

    toast({
      title: t('success'),
      description: 'Anúncio/Job publicado com sucesso!',
    })

    if (linkToProject && data.projectId) {
      navigate(`/construction/projects/${data.projectId}`)
    } else {
      navigate('/')
    }
  }

  const getPageTitle = () => {
    switch (typeParam) {
      case 'product':
        return 'Anunciar Produto'
      case 'rental':
        return 'Anunciar Imóvel / Equipamento'
      case 'community':
        return 'Postagem na Comunidade'
      default:
        return t('sidebar.post_job')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <PremiumConstructionModal
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
      />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
        <p className="text-muted-foreground">
          Preencha as informações para disponibilizar no marketplace.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {typeParam === 'job' && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className={linkToProject ? 'pb-4' : ''}>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <HardHat className="h-5 w-5" />{' '}
                    {t('construction.table.project')}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-normal">
                    <Label
                      htmlFor="link-project"
                      className="cursor-pointer font-medium"
                    >
                      Vincular este serviço a uma obra existente?
                    </Label>
                    <Switch
                      id="link-project"
                      checked={linkToProject}
                      onCheckedChange={handleToggleLink}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              {linkToProject && (
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {t('construction.table.project')} (Opcional)
                        </FormLabel>
                        <Popover
                          open={openProject}
                          onOpenChange={setOpenProject}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value
                                  ? projects.find((p) => p.id === field.value)
                                      ?.name
                                  : t('general.select')}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0"
                            style={{
                              width: 'var(--radix-popover-trigger-width)',
                            }}
                          >
                            <Command>
                              <CommandInput
                                placeholder={t('general.search') || 'Buscar...'}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Nenhum projeto encontrado.
                                </CommandEmpty>
                                <CommandGroup>
                                  {projects.map((p) => (
                                    <CommandItem
                                      key={p.id}
                                      value={p.name}
                                      onSelect={() => {
                                        form.setValue('projectId', p.id)
                                        form.setValue('stageId', '')
                                        setOpenProject(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          p.id === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {p.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stageId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {t('proj.partner.stage')} (Opcional)
                        </FormLabel>
                        <Popover open={openStage} onOpenChange={setOpenStage}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={!selectedProjectId}
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value
                                  ? availableStages.find(
                                      (s) => s.id === field.value,
                                    )?.name
                                  : t('general.select')}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0"
                            style={{
                              width: 'var(--radix-popover-trigger-width)',
                            }}
                          >
                            <Command>
                              <CommandInput
                                placeholder={t('general.search') || 'Buscar...'}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Nenhuma etapa encontrada.
                                </CommandEmpty>
                                <CommandGroup>
                                  {availableStages.map((s) => (
                                    <CommandItem
                                      key={s.id}
                                      value={s.name}
                                      onSelect={() => {
                                        form.setValue('stageId', s.id)
                                        setOpenStage(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          s.id === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {s.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('plans.field.title')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do Anúncio/Vaga" {...field} />
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
                    <FormLabel>{t('plans.field.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhes completos..."
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
                      <FormLabel>{t('market.category')}</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val)
                          form.setValue('subCategory', '')
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('general.select')} />
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
                      <FormLabel>{t('job.subcategory')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={
                          !selectedCategory || !availableSubCategories.length
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('general.select')} />
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

              {/* Contact Phone */}
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel>{t('job.post.contact')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('settings.placeholder.phone')}
                          className="pl-9"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              maskPhone(e.target.value, currentLanguage),
                            )
                          }
                          maxLength={currentLanguage === 'pt' ? 15 : 14}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deadline */}
              <FormField
                control={form.control}
                name="maxExecutionDeadline"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel>Data Limite / Validade</FormLabel>
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
                              format(field.value, 'PPP', {
                                locale: getDateLocale(),
                              })
                            ) : (
                              <span>{t('date')}</span>
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
                          locale={getDateLocale()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('job.post.location')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.address.zip')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('settings.placeholder.zip')}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              maskZip(e.target.value, currentLanguage),
                            )
                          }
                          maxLength={currentLanguage === 'pt' ? 9 : 5}
                        />
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
                      <FormLabel>{t('settings.address.city')}</FormLabel>
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
                      <FormLabel>{t('settings.address.state')}</FormLabel>
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
                      <FormLabel>{t('settings.address.street')}</FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} />
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
                      <FormLabel>{t('settings.address.number')}</FormLabel>
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
                      <FormLabel>
                        {t('settings.address.neighborhood')}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} />
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
                      <FormLabel>{t('settings.address.complement')}</FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} />
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
              <CardTitle>Precificação e Tipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {typeParam === 'job' && (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t('job.type')}</FormLabel>
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
                              <span className="font-semibold">
                                {t('job.fixed_price')}
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
                                {t('job.auction_reverse')}
                              </span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('type') === 'auction' && typeParam === 'job'
                          ? t('job.max_initial')
                          : 'Valor / Orçamento Estimado'}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormDescription>
                        {typeParam === 'community'
                          ? 'Deixe 0.00 se for grátis.'
                          : t('job.post.budget_help')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('type') === 'auction' && typeParam === 'job' && (
                  <FormField
                    control={form.control}
                    name="auctionEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('job.end_date')}</FormLabel>
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
                                  format(field.value, 'PPP', {
                                    locale: getDateLocale(),
                                  })
                                ) : (
                                  <span>{t('date')}</span>
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
                              locale={getDateLocale()}
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

          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('job.photos')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel>{t('job.upload')}</FormLabel>
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
                    {t('eq.select.file')}
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>{t('job.link')}</FormLabel>
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
                    <LinkIcon className="h-4 w-4 mr-2" /> {t('add')}
                  </Button>
                </div>
              </div>

              {photos.length > 0 && (
                <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group shrink-0">
                      <img
                        src={photo}
                        alt="Preview"
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

          {/* Premium Options */}
          <Card>
            <CardHeader>
              <CardTitle>{t('ad.highlight')}</CardTitle>
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
                            <span className="font-semibold">
                              {t('job.premium.free')}
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
                              {t('job.premium.region')}
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
                              {t('job.premium.category')}
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
              onClick={() => navigate('/')}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" size="lg" disabled={!form.formState.isValid}>
              Publicar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
