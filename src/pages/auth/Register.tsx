import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  getCountryValidation,
  commonValidation,
  CountryCode,
} from '@/lib/validation'
import {
  Loader2,
  User,
  Briefcase,
  Building2,
  UserCircle,
  MapPin,
  CreditCard,
} from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

const createRegisterSchema = (country: CountryCode) => {
  const { phone, zip } = getCountryValidation(country)

  return z
    .object({
      name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
      email: commonValidation.email,
      password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
      confirmPassword: z.string(),
      role: z.enum(['contractor', 'executor']),
      entityType: z.enum(['pf', 'pj']),
      country: z.enum(['BR', 'US']),
      businessArea: z.string().optional(),

      // Address Fields
      street: z.string().min(3, 'Rua é obrigatória'),
      number: z.string().min(1, 'Número é obrigatório'),
      complement: z.string().optional(),
      neighborhood: z.string().min(2, 'Bairro é obrigatório'),
      city: z.string().min(2, 'Cidade é obrigatória'),
      state: z.string().min(2, 'Estado é obrigatório'),
      zipCode: zip,
      phone: phone,

      // Executor specific fields
      category: z.string().optional(),
      bank: z.string().optional(),
      agency: z.string().optional(),
      account: z.string().optional(),
      document: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Senhas não conferem',
      path: ['confirmPassword'],
    })
    .refine(
      (data) => {
        if (data.entityType === 'pj' && !data.businessArea) return false
        return true
      },
      {
        message: 'Área de atuação é obrigatória para PJ',
        path: ['businessArea'],
      },
    )
    .refine(
      (data) => {
        if (data.role === 'executor' && !data.category) return false
        return true
      },
      {
        message: 'Categoria profissional é obrigatória para Executores',
        path: ['category'],
      },
    )
}

type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>

export default function Register() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [country, setCountry] = useState<CountryCode>('BR')

  const form = useForm<RegisterForm>({
    resolver: (values, context, options) => {
      return zodResolver(createRegisterSchema(country))(
        values,
        context,
        options,
      )
    },
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'contractor',
      entityType: 'pf',
      country: 'BR',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      bank: '',
      agency: '',
      account: '',
      document: '',
    },
  })

  const role = form.watch('role')
  const entityType = form.watch('entityType')

  const handleCountryChange = (val: CountryCode) => {
    setCountry(val)
    form.setValue('country', val)
    form.trigger(['phone', 'zipCode'])
  }

  async function onSubmit(data: RegisterForm) {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        entityType: data.entityType,
        businessArea: data.businessArea,
        category: data.category,
        taxId: '', // To be filled in Profile Edit
        address: {
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        bankingDetails:
          data.role === 'executor'
            ? {
                bank: data.bank!,
                agency: data.agency!,
                account: data.account!,
                document: data.document!,
              }
            : undefined,
      })
      toast({
        title: t('success'),
        description: `Bem-vindo ao BIDWORK como ${data.role === 'contractor' ? 'Contratante' : 'Executor'}.`,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Tente novamente mais tarde.',
      })
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full h-[calc(100vh-100px)] flex flex-col">
      <div className="space-y-2 text-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('auth.register.title')}
        </h1>
        <p className="text-muted-foreground">{t('auth.register.subtitle')}</p>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pb-4"
          >
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País / Country</FormLabel>
                  <Select
                    onValueChange={(val) =>
                      handleCountryChange(val as CountryCode)
                    }
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BR">Brasil</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Eu quero...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="contractor"
                          id="contractor"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="contractor"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                        >
                          <User className="mb-3 h-6 w-6" />
                          <span className="font-semibold">Contratar</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Publicar Jobs
                          </span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="executor"
                          id="executor"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="executor"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                        >
                          <Briefcase className="mb-3 h-6 w-6" />
                          <span className="font-semibold">Trabalhar</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Fazer Lances
                          </span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entityType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Pessoa</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pf" id="pf" />
                        <label
                          htmlFor="pf"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <UserCircle className="h-4 w-4" /> Pessoa Física (CPF)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pj" id="pj" />
                        <label
                          htmlFor="pj"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Building2 className="h-4 w-4" /> Pessoa Jurídica
                          (CNPJ)
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {entityType === 'pj' && (
              <FormField
                control={form.control}
                name="businessArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Atuação da Empresa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="construction">
                          Construção Civil
                        </SelectItem>
                        <SelectItem value="industry">Indústria</SelectItem>
                        <SelectItem value="technology">Tecnologia</SelectItem>
                        <SelectItem value="services">
                          Serviços Gerais
                        </SelectItem>
                        <SelectItem value="retail">Varejo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {role === 'executor' && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sua Categoria Profissional</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua especialidade" />
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
            )}

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {entityType === 'pj' ? 'Razão Social' : 'Nome Completo'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          entityType === 'pj'
                            ? 'Minha Empresa Ltda'
                            : 'João Silva'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            country === 'BR'
                              ? '(11) 99999-0000'
                              : '(555) 555-0123'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {country === 'BR' ? 'CEP' : 'Zip Code'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={country === 'BR' ? '00000-000' : '12345'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua das Flores" {...field} />
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

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro" {...field} />
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
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
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
                      <FormLabel>UF/State</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {role === 'executor' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-primary">
                  <CreditCard className="h-5 w-5" />
                  <h3 className="font-semibold">
                    Dados Bancários para Recebimento
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banco</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Nubank" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agência</FormLabel>
                        <FormControl>
                          <Input placeholder="0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conta</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ Titular</FormLabel>
                        <FormControl>
                          <Input placeholder="Documento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.register.title')}
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <div className="text-center text-sm pt-4 shrink-0">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t('auth.login')}
        </Link>
      </div>
    </div>
  )
}
