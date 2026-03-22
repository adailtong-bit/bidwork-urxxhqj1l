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
  Loader2,
  Phone,
  Link as LinkIcon,
  Check,
  ChevronsUpDown,
  HardHat,
  Image as ImageIcon,
  X,
  MapPin,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn, maskPhone, maskZip } from '@/lib/utils'
import { format } from 'date-fns'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CurrencyInput } from '@/components/CurrencyInput'
import { getCountryValidation } from '@/lib/validation'
import { PremiumConstructionModal } from '@/components/PremiumConstructionModal'
import { SafeImage } from '@/components/SafeImage'

export default function PostJob() {
  const { addJob, getJob, updateJob } = useJobStore()
  const { user } = useAuthStore()
  const { categories } = useCategoryStore()
  const { projects, updateStageActuals } = useProjectStore()
  const { t, getDateLocale, currentLanguage, formatCurrency } =
    useLanguageStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const preProjectId = searchParams.get('projectId') || ''
  const preStageId = searchParams.get('stageId') || ''

  const editId = searchParams.get('edit') || ''
  const editingJob = editId ? getJob(editId) : undefined
  const isEditing = !!editingJob

  const typeParam = isEditing
    ? editingJob.listingType || 'job'
    : searchParams.get('type') || 'job'

  const [photos, setPhotos] = useState<string[]>(editingJob?.photos || [])
  const [photoInput, setPhotoInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [linkToProject, setLinkToProject] = useState(
    isEditing ? !!editingJob?.projectId : !!preProjectId,
  )
  const [openProject, setOpenProject] = useState(false)
  const [openStage, setOpenStage] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const isSubscribed = user?.constructionSubscription?.active

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
    zipCode: zipValidation,
    street: z.string().min(3, t('val.required')),
    number: z.string().min(1, t('val.required')),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, t('val.required')),
    city: z.string().min(2, t('val.required')),
    state: z.string().length(2, t('val.required')),
    // Job
    budget: z.number().optional(),
    auctionEndDate: z.date().optional(),
    // Product
    condition: z.enum(['new', 'like_new', 'good', 'fair']).optional(),
    salePrice: z.number().optional(),
    // Rental
    minRentalPeriod: z.coerce.number().optional(),
    rentalRate: z.number().optional(),
    rentalRateType: z.enum(['daily', 'monthly']).optional(),
    // General
    maxExecutionDeadline: z
      .date({
        required_error: t('val.required'),
      })
      .optional(),
    publicationDate: z.date().default(new Date()),
    premiumType: z.enum(['none', 'region', 'category']),
    projectId: z.string().optional(),
    stageId: z.string().optional(),
  })

  type JobForm = z.infer<typeof jobSchema>

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: editingJob?.title || '',
      description: editingJob?.description || '',
      type: editingJob?.type || 'fixed',
      category: editingJob?.category || '',
      subCategory: editingJob?.subCategory || '',
      contactPhone: editingJob?.contactPhone || user?.phone || '',
      zipCode: editingJob?.address?.zipCode || user?.address?.zipCode || '',
      street: editingJob?.address?.street || user?.address?.street || '',
      number: editingJob?.address?.number || user?.address?.number || '',
      complement:
        editingJob?.address?.complement || user?.address?.complement || '',
      neighborhood:
        editingJob?.address?.neighborhood || user?.address?.neighborhood || '',
      city:
        editingJob?.address?.city ||
        user?.location?.split(' - ')[0] ||
        user?.address?.city ||
        '',
      state:
        editingJob?.address?.state ||
        user?.location?.split(' - ')[1] ||
        user?.address?.state ||
        '',
      budget: editingJob?.budget || 0,
      salePrice: editingJob?.salePrice || 0,
      rentalRate: editingJob?.rentalRate || 0,
      rentalRateType: editingJob?.rentalRateType || 'monthly',
      minRentalPeriod: editingJob?.minRentalPeriod || 1,
      condition: editingJob?.condition || 'new',
      publicationDate: editingJob?.publicationDate || new Date(),
      maxExecutionDeadline: editingJob?.maxExecutionDeadline || undefined,
      auctionEndDate: editingJob?.auctionEndDate || undefined,
      premiumType: editingJob?.premiumType || 'none',
      projectId: editingJob?.projectId || preProjectId,
      stageId: editingJob?.stageId || preStageId,
    },
  })

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

    if (
      data.type === 'auction' &&
      typeParam === 'job' &&
      !data.auctionEndDate
    ) {
      form.setError('auctionEndDate', {
        message: t('val.required'),
      })
      return
    }

    const fullLocation = `${data.city} - ${data.state}`

    let finalBudget = data.budget
    if (typeParam === 'product') finalBudget = data.salePrice || 0
    if (typeParam === 'rental') finalBudget = data.rentalRate || 0

    const payload = {
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
      budget: finalBudget,
      condition: typeParam === 'product' ? data.condition : undefined,
      salePrice: typeParam === 'product' ? data.salePrice : undefined,
      rentalRate: typeParam === 'rental' ? data.rentalRate : undefined,
      rentalRateType: typeParam === 'rental' ? data.rentalRateType : undefined,
      minRentalPeriod:
        typeParam === 'rental' ? data.minRentalPeriod : undefined,
      publicationDate: data.publicationDate,
      auctionEndDate: data.auctionEndDate,
      maxExecutionDeadline: data.maxExecutionDeadline,
      premiumType: data.premiumType,
      projectId: linkToProject ? data.projectId || undefined : undefined,
      stageId: linkToProject ? data.stageId || undefined : undefined,
      regionCode: data.state,
      contactPhone: data.contactPhone,
      listingType: typeParam,
    }

    if (isEditing && editingJob) {
      updateJob(editingJob.id, payload)
      toast({
        title: t('success'),
        description: t('post.edit.success'),
      })
    } else {
      addJob({
        ...payload,
        ownerId: user.id,
        ownerName: user.name,
      })

      if (
        linkToProject &&
        data.projectId &&
        data.stageId &&
        data.type === 'fixed' &&
        typeParam === 'job'
      ) {
        updateStageActuals(
          data.projectId,
          data.stageId,
          'labor',
          data.budget || 0,
        )
      }

      toast({
        title: t('success'),
        description: t('post.success'),
      })
    }

    if (linkToProject && data.projectId) {
      navigate(`/construction/projects/${data.projectId}`)
    } else {
      navigate('/')
    }
  }

  const getPageTitle = () => {
    if (isEditing) return t('post.edit.title')
    switch (typeParam) {
      case 'product':
        return t('post.type.product.title')
      case 'rental':
        return t('post.type.rental.title')
      case 'community':
        return t('post.type.community.title')
      default:
        return t('post.type.job.title')
    }
  }

  // Helper for rendering preview details
  const renderPreviewDetails = () => {
    const values = form.getValues()
    let displayPrice = values.budget || 0
    if (typeParam === 'product') displayPrice = values.salePrice || 0
    if (typeParam === 'rental') displayPrice = values.rentalRate || 0

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-2xl font-bold break-words">
              {values.title || 'Sem Título'}
            </h2>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {displayPrice === 0
                  ? t('post.free_help')
                  : formatCurrency(displayPrice)}
              </div>
              {typeParam === 'rental' && (
                <span className="text-sm text-muted-foreground">
                  /{' '}
                  {values.rentalRateType === 'daily'
                    ? t('post.rate.daily')
                    : t('post.rate.monthly')}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="font-normal">
              {values.category || 'Categoria'}
            </Badge>
            {values.subCategory && (
              <Badge variant="outline" className="font-normal">
                {values.subCategory}
              </Badge>
            )}
            {typeParam === 'product' && values.condition && (
              <Badge variant="secondary" className="font-normal">
                {t(`post.condition.${values.condition}`)}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {values.city || 'Cidade'}, {values.state || 'UF'}
            </span>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="aspect-video relative overflow-hidden rounded-xl bg-muted">
            <SafeImage
              src={photos[0]}
              alt="Preview principal"
              className="object-cover w-full h-full"
            />
            {photos.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                + {photos.length - 1} fotos
              </div>
            )}
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-sm md:text-base break-words whitespace-pre-wrap">
          {values.description || 'Nenhuma descrição fornecida.'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <PremiumConstructionModal
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
      />

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              {t('post.preview.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-card rounded-lg border mt-2">
            {renderPreviewDetails()}
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowPreview(false)}
              className="w-full sm:w-auto"
            >
              {t('post.preview.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
        <p className="text-muted-foreground">{t('post.form.desc')}</p>
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
                      {t('post.link_project')}
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
                        <FormLabel>{t('post.project_opt')}</FormLabel>
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
                              <CommandInput placeholder={t('general.search')} />
                              <CommandList>
                                <CommandEmpty>
                                  {t('post.no_projects')}
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
                        <FormLabel>{t('post.stage_opt')}</FormLabel>
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
                              <CommandInput placeholder={t('general.search')} />
                              <CommandList>
                                <CommandEmpty>
                                  {t('post.no_stages')}
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

          <Card>
            <CardHeader>
              <CardTitle>{t('post.basic_info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('plans.field.title')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('post.title_placeholder')}
                        {...field}
                      />
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
                        placeholder={t('post.desc_placeholder')}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="maxExecutionDeadline"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel>{t('post.deadline')}</FormLabel>
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
                        <Input
                          placeholder={t('post.placeholder.city')}
                          {...field}
                        />
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
                          placeholder={t('post.placeholder.state')}
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
                        <Input
                          placeholder={t('post.placeholder.generic')}
                          {...field}
                        />
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
                        <Input
                          placeholder={t('post.placeholder.number')}
                          {...field}
                        />
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
                        <Input
                          placeholder={t('post.placeholder.generic')}
                          {...field}
                        />
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
                        <Input
                          placeholder={t('post.placeholder.generic')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('post.pricing_type')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {typeParam === 'job' && (
                <>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch('type') === 'auction'
                              ? t('job.max_initial')
                              : t('post.budget_est')}
                          </FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormDescription>
                            {t('job.post.budget_help')}
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
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
                </>
              )}

              {typeParam === 'product' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('post.condition')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('general.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">
                              {t('post.condition.new')}
                            </SelectItem>
                            <SelectItem value="like_new">
                              {t('post.condition.like_new')}
                            </SelectItem>
                            <SelectItem value="good">
                              {t('post.condition.good')}
                            </SelectItem>
                            <SelectItem value="fair">
                              {t('post.condition.fair')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('post.sale_price')}</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {typeParam === 'rental' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="minRentalPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('post.min_rental_period')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rentalRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('post.rental_rate')}</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rentalRateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('post.pricing_type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('general.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">
                              {t('post.rate.daily')}
                            </SelectItem>
                            <SelectItem value="monthly">
                              {t('post.rate.monthly')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {typeParam === 'community' && (
                <p className="text-sm text-muted-foreground py-4">
                  {t('post.free_help')}
                </p>
              )}
            </CardContent>
          </Card>

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
                    placeholder={t('post.placeholder.url')}
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

          <div className="flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 border-t z-10">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/')}
            >
              {t('post.cancel')}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t('post.preview')}
            </Button>
            <Button type="submit" size="lg" disabled={!form.formState.isValid}>
              {t('post.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
