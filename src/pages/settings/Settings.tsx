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
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { getCountryValidation, CountryCode } from '@/lib/validation'
import {
  Building2,
  MapPin,
  ShieldCheck,
  User as UserIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trophy,
  Award,
  Edit2,
  Save,
  X,
  CreditCard,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdSection } from '@/components/AdSection'

// Dynamic schema based on user type and country
const createProfileSchema = (entityType: 'pf' | 'pj', country: CountryCode) => {
  const { phone, zip, taxId } = getCountryValidation(country)

  return z.object({
    name: z
      .string()
      .min(2, 'Nome/Razão Social deve ter no mínimo 2 caracteres'),
    companyName:
      entityType === 'pj'
        ? z.string().min(2, 'Nome da Empresa é obrigatório')
        : z.string().optional(),
    phone: phone,
    taxId: taxId,
    // Address
    street: z.string().min(3, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Bairro é obrigatório'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório'),
    zipCode: zip,
  })
}

type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>

export default function Settings() {
  const { user, updateSettings, submitKYC } = useAuthStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  // Ensure hooks are always called in the same order
  // Safe defaults for when user is null (to satisfy hook rules)
  const entityType = user?.entityType || 'pf'
  const country = user?.address?.country || 'BR'

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(createProfileSchema(entityType, country)),
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
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [banking, setBanking] = useState(
    user?.bankingDetails || { bank: '', agency: '', account: '', document: '' },
  )
  const [radius, setRadius] = useState([user?.serviceRadius || 10])
  const [isUploadingKYC, setIsUploadingKYC] = useState(false)

  // Sync form and local state when user data becomes available or updates
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
      })

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

  const onSubmit = (data: ProfileFormValues) => {
    updateSettings({
      name: data.name,
      companyName: data.companyName,
      phone: data.phone,
      taxId: data.taxId,
      address: {
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: country,
      },
    })
    setIsEditing(false)
    toast({
      title: t('success'),
      description: 'Perfil atualizado com sucesso.',
    })
  }

  const handleSaveBanking = () => {
    updateSettings({
      bankingDetails: banking,
      serviceRadius: radius[0],
    })
    toast({
      title: t('success'),
      description: 'Configurações adicionais salvas.',
    })
  }

  const handleKYCUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingKYC(true)
    try {
      await submitKYC(file)
      toast({
        title: 'Documento Enviado',
        description: 'Sua identidade foi verificada com sucesso!',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Tente novamente.',
      })
    } finally {
      setIsUploadingKYC(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <AdSection segment="profile" />

      <h1 className="text-3xl font-bold tracking-tight">{t('nav.settings')}</h1>

      <div className="grid gap-6">
        {/* Profile Info Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  {user.entityType === 'pj'
                    ? 'Perfil Corporativo'
                    : 'Perfil Pessoal'}
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações de cadastro.
                </CardDescription>
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
                            ? 'Razão Social'
                            : 'Nome Completo'}
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
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled className="bg-muted" />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="(00) 00000-0000"
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
                        <FormLabel>
                          {user.entityType === 'pj' ? 'CNPJ' : 'CPF'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" /> Endereço Completo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP/Zip</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
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
                        <FormLabel>Rua</FormLabel>
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
                        <FormLabel>Número</FormLabel>
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
                        <FormLabel>Comp.</FormLabel>
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
                        <FormLabel>Bairro</FormLabel>
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
                        <FormLabel>Cidade</FormLabel>
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
                        <FormLabel>Estado/UF</FormLabel>
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

        {/* Banking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Dados Bancários
            </CardTitle>
            <CardDescription>
              Informações criptografadas para recebimento de pagamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Banco</Label>
                <Input
                  placeholder="Ex: Nubank"
                  value={banking.bank}
                  onChange={(e) =>
                    setBanking({ ...banking, bank: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Agência</Label>
                <Input
                  placeholder="0000"
                  value={banking.agency}
                  onChange={(e) =>
                    setBanking({ ...banking, agency: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Conta</Label>
                <Input
                  placeholder="00000-0"
                  value={banking.account}
                  onChange={(e) =>
                    setBanking({ ...banking, account: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>CPF/CNPJ (Titular)</Label>
              <div className="relative">
                <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Documento para faturamento"
                  value={banking.document}
                  onChange={(e) =>
                    setBanking({ ...banking, document: e.target.value })
                  }
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
              <MapPin className="h-5 w-5" /> Raio de Atuação (Geofencing)
            </CardTitle>
            <CardDescription>
              Defina a distância máxima para encontrar serviços ou prestadores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Raio de Cobertura</Label>
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
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> Verificação de
              Identidade (KYC)
            </CardTitle>
            <CardDescription>
              Aumente a confiança no seu perfil enviando um documento oficial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.kycStatus === 'verified' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
                <h3 className="text-lg font-semibold text-green-800">
                  Identidade Verificada
                </h3>
              </div>
            ) : user.kycStatus === 'pending' ? (
              <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-12 w-12 text-yellow-600 mb-2 animate-pulse" />
                <h3 className="text-lg font-semibold text-yellow-800">
                  Em Análise
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
                      {isUploadingKYC
                        ? 'Enviando...'
                        : 'Clique para enviar documento (RG ou CNH)'}
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
