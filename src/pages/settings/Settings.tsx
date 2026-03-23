import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore, Currency } from '@/stores/useLanguageStore'
import { getCountryValidation, CountryCode } from '@/lib/validation'
import { maskPhone, maskZip, maskTaxId } from '@/lib/utils'
import {
  Building2,
  MapPin,
  ShieldCheck,
  User as UserIcon,
  Upload,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  X,
  CreditCard,
  Globe,
  Lock,
  Bell,
} from 'lucide-react'
import { AdSection } from '@/components/AdSection'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Settings() {
  const { user, updateSettings, submitKYC } = useAuthStore()
  const { toast } = useToast()
  const { t, currentLanguage, setLanguage, currentCurrency, setCurrency } =
    useLanguageStore()

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    (user?.address?.country as CountryCode) || 'BR',
  )

  const entityType = user?.entityType || 'pf'

  const createProfileSchema = (
    entityType: 'pf' | 'pj',
    country: CountryCode,
  ) => {
    const { phone, zip, taxId } = getCountryValidation(country)

    return z.object({
      name: z.string().min(2, t('val.required')),
      companyName:
        entityType === 'pj'
          ? z.string().min(2, t('val.required'))
          : z.string().optional(),
      phone: phone,
      taxId: taxId,
      street: z.string().min(3, t('val.required')),
      number: z.string().min(1, t('val.required')),
      complement: z.string().optional(),
      neighborhood: z.string().min(2, t('val.required')),
      city: z.string().min(2, t('val.required')),
      state: z.string().min(2, t('val.required')),
      zipCode: zip,
      openChat: z.boolean().default(false),
    })
  }

  const form = useForm({
    resolver: zodResolver(createProfileSchema(entityType, selectedCountry)),
    defaultValues: {
      name: user?.name || '',
      companyName: user?.companyName || '',
      phone: user?.phone || '',
      taxId: user?.taxId || '',
      street: user?.address?.street || '',
      number: user?.address?.number || '',
      complement: user?.address?.complement || '',
      neighborhood: user?.address?.neighborhood || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      openChat: user?.openChat || false,
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [banking, setBanking] = useState(
    user?.bankingDetails || { bank: '', agency: '', account: '', document: '' },
  )
  const [radius, setRadius] = useState([user?.serviceRadius || 10])
  const [isUploadingKYC, setIsUploadingKYC] = useState(false)

  const currentPrefs = user?.notificationPreferences || {
    emailInterests: true,
    pushInterests: false,
  }

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        companyName: user.companyName || '',
        phone: user.phone || '',
        taxId: user.taxId || '',
        street: user.address?.street || '',
        number: user.address?.number || '',
        complement: user.address?.complement || '',
        neighborhood: user.address?.neighborhood || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        openChat: user.openChat || false,
      })

      if (user.address?.country) {
        setSelectedCountry(user.address.country as CountryCode)
      }

      setBanking(
        user.bankingDetails || {
          bank: '',
          agency: '',
          account: '',
          document: '',
        },
      )
      setRadius([user.serviceRadius || 10])
    }
  }, [user, form])

  if (!user) return null

  const onSubmit = (data: any) => {
    updateSettings({
      name: data.name,
      companyName: data.companyName,
      phone: data.phone,
      taxId: data.taxId,
      openChat: data.openChat,
      address: {
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: selectedCountry,
      },
    })
    setIsEditing(false)
    toast({
      title: t('success'),
      description: t('success'),
    })
  }

  const handleSaveBanking = () => {
    updateSettings({
      bankingDetails: banking,
      serviceRadius: radius[0],
    })
    toast({
      title: t('success'),
      description: t('success'),
    })
  }

  const handleKYCUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingKYC(true)
    try {
      await submitKYC(file)
      toast({
        title: t('settings.doc_sent'),
        description: t('settings.doc_sent_desc'),
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('error'),
      })
    } finally {
      setIsUploadingKYC(false)
    }
  }

  const handleLanguageChange = (val: string) => {
    setLanguage(val as 'pt' | 'en' | 'es')
    toast({
      title: t('success'),
      description: t('settings.lang_changed', { lang: val.toUpperCase() }),
    })
  }

  const handlePushToggle = async (val: boolean) => {
    if (val && typeof window !== 'undefined' && 'Notification' in window) {
      let perm = Notification.permission
      if (perm !== 'granted' && perm !== 'denied') {
        perm = await Notification.requestPermission()
      }
      if (perm === 'granted') {
        updateSettings({
          notificationPreferences: {
            ...currentPrefs,
            pushInterests: true,
          },
        })
        toast({
          title: t('success'),
          description: 'Notificações push ativadas.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Permissão Negada',
          description: 'Ative as notificações nas configurações do navegador.',
        })
      }
    } else {
      updateSettings({
        notificationPreferences: {
          ...currentPrefs,
          pushInterests: false,
        },
      })
    }
  }

  const handleEmailToggle = (val: boolean) => {
    updateSettings({
      notificationPreferences: {
        ...currentPrefs,
        emailInterests: val,
      },
    })
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <AdSection segment="profile" />

      <h1 className="text-3xl font-bold tracking-tight">
        {t('settings.title')}
      </h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  {user.entityType === 'pj'
                    ? t('settings.profile.corporate')
                    : t('settings.profile.personal')}
                </CardTitle>
                <CardDescription>{t('settings.profile.desc')}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {user.isVerified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" /> {t('header.verified')}
                  </div>
                )}
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> {t('edit')}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="mr-2 h-4 w-4" /> {t('cancel')}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {user.entityType === 'pj'
                            ? t('settings.form.company')
                            : t('settings.form.name')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user.entityType === 'pj' && (
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.form.fantasy')}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="space-y-2">
                    <Label>{t('settings.form.email')}</Label>
                    <Input value={user.email} disabled className="bg-muted" />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.form.phone')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder={t('settings.placeholder.phone')}
                            onChange={(e) =>
                              field.onChange(
                                maskPhone(e.target.value, selectedCountry),
                              )
                            }
                            maxLength={selectedCountry === 'BR' ? 15 : 14}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.form.tax_id')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder={t('settings.placeholder.doc')}
                            onChange={(e) =>
                              field.onChange(
                                maskTaxId(e.target.value, selectedCountry),
                              )
                            }
                            maxLength={selectedCountry === 'BR' ? 18 : 14}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <div className="bg-muted/20 border rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Controles de Privacidade
                  </h3>
                  <FormField
                    control={form.control}
                    name="openChat"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            Open Chat (Chat Aberto)
                          </FormLabel>
                          <FormDescription>
                            Permite que qualquer usuário inicie uma conversa
                            diretamente com você sem precisar de aprovação
                            prévia de interesse.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditing}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {t('settings.address.title')}
                  </h3>
                  {isEditing && (
                    <Select
                      value={selectedCountry}
                      onValueChange={(val: CountryCode) =>
                        setSelectedCountry(val)
                      }
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder={t('general.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BR">{t('country.br')}</SelectItem>
                        <SelectItem value="US">{t('country.us')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.address.zip')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder={t('settings.placeholder.zip')}
                            onChange={(e) =>
                              field.onChange(
                                maskZip(e.target.value, selectedCountry),
                              )
                            }
                            maxLength={selectedCountry === 'BR' ? 9 : 5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>{t('settings.address.street')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.address.number')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
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
                        <FormLabel>
                          {t('settings.address.complement')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('settings.address.neighborhood')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
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
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.address.state')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" /> {t('save')}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Preferências de Notificação
            </CardTitle>
            <CardDescription>
              Gerencie como deseja ser avisado sobre novas oportunidades de
              negócios e interesses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 bg-background gap-4">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Alertas por E-mail
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba um e-mail com detalhes quando alguém demonstrar
                  interesse nas suas ofertas.
                </p>
              </div>
              <Switch
                checked={currentPrefs.emailInterests}
                onCheckedChange={handleEmailToggle}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 bg-background gap-4">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Notificações Push (Navegador)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas instantâneos diretamente na sua tela, mesmo em
                  segundo plano.
                </p>
              </div>
              <Switch
                checked={currentPrefs.pushInterests}
                onCheckedChange={handlePushToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> {t('settings.language.title')}
            </CardTitle>
            <CardDescription>{t('settings.language.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/2">
                <Label className="mb-2 block">
                  {t('settings.language.select')}
                </Label>
                <Select
                  value={currentLanguage}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">{t('language.pt')}</SelectItem>
                    <SelectItem value="en">{t('language.en')}</SelectItem>
                    <SelectItem value="es">{t('language.es')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/2">
                <Label className="mb-2 block">
                  {t('settings.currency.select')}
                </Label>
                <Select
                  value={currentCurrency}
                  onValueChange={(val: Currency) => setCurrency(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">{t('currency.usd')}</SelectItem>
                    <SelectItem value="BRL">{t('currency.brl')}</SelectItem>
                    <SelectItem value="EUR">{t('currency.eur')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> {t('settings.banking.title')}
            </CardTitle>
            <CardDescription>{t('settings.banking.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>{t('settings.banking.bank')}</Label>
                <Input
                  placeholder={t('settings.placeholder.bank')}
                  value={banking.bank}
                  onChange={(e) =>
                    setBanking({ ...banking, bank: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('settings.banking.agency')}</Label>
                <Input
                  placeholder={t('settings.placeholder.agency')}
                  value={banking.agency}
                  onChange={(e) =>
                    setBanking({ ...banking, agency: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('settings.banking.account')}</Label>
                <Input
                  placeholder={t('settings.placeholder.account')}
                  value={banking.account}
                  onChange={(e) =>
                    setBanking({ ...banking, account: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('settings.banking.doc')}</Label>
              <div className="relative">
                <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={t('settings.placeholder.doc')}
                  value={banking.document}
                  onChange={(e) =>
                    setBanking({
                      ...banking,
                      document: maskTaxId(e.target.value, selectedCountry),
                    })
                  }
                  maxLength={selectedCountry === 'BR' ? 18 : 14}
                />
              </div>
            </div>
            <Button onClick={handleSaveBanking}>{t('save')}</Button>
          </CardContent>
        </Card>

        {/* Geofencing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> {t('settings.geo.title')}
            </CardTitle>
            <CardDescription>{t('settings.geo.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>{t('settings.geo.radius')}</Label>
              <span className="font-bold text-primary">{radius[0]} km</span>
            </div>
            <Slider
              value={radius}
              onValueChange={setRadius}
              max={100}
              step={1}
              className="w-full"
            />
            <Button onClick={handleSaveBanking} className="mt-4">
              {t('save')}
            </Button>
          </CardContent>
        </Card>

        {/* KYC Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />{' '}
              {t('settings.kyc.title')}
            </CardTitle>
            <CardDescription>{t('settings.kyc.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {user.kycStatus === 'verified' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
                <h3 className="text-lg font-semibold text-green-800">
                  {t('settings.kyc.verified')}
                </h3>
              </div>
            ) : user.kycStatus === 'pending' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-12 w-12 text-yellow-600 mb-2 animate-pulse" />
                <h3 className="text-lg font-semibold text-yellow-800">
                  {t('settings.kyc.pending')}
                </h3>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/20 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleKYCUpload}
                    disabled={isUploadingKYC}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload
                      className={`h-8 w-8 text-muted-foreground ${isUploadingKYC ? 'animate-bounce' : ''}`}
                    />
                    <p className="font-medium">
                      {isUploadingKYC ? t('loading') : t('settings.kyc.upload')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
