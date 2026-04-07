import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  getCountryValidation,
  commonValidation,
  CountryCode,
} from '@/lib/validation'
import { maskPhone, maskZip } from '@/lib/utils'
import {
  Loader2,
  User,
  Briefcase,
  Building2,
  UserCircle,
  CreditCard,
  ArrowLeft,
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

export default function Register() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t, currentLanguage } = useLanguageStore()

  const [country, setCountry] = useState<CountryCode>('BR')

  const createRegisterSchema = (country: CountryCode) => {
    const { phone, zip } = getCountryValidation(country)

    return z
      .object({
        name: z.string().min(2, t('val.required')),
        email: commonValidation.email,
        password: z.string().min(6, t('val.required')),
        confirmPassword: z.string(),
        role: z.enum(['contractor', 'executor']),
        entityType: z.enum(['pf', 'pj']),
        country: z.enum(['BR', 'US']),
        businessArea: z.string().optional(),
        // Address Fields
        street: z.string().min(3, t('val.required')),
        number: z.string().min(1, t('val.required')),
        complement: z.string().optional(),
        neighborhood: z.string().min(2, t('val.required')),
        city: z.string().min(2, t('val.required')),
        state: z.string().min(2, t('val.required')),
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
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
  }

  const form = useForm({
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

  const role = form.watch('role' as any)
  const entityType = form.watch('entityType' as any)

  const handleCountryChange = (val: CountryCode) => {
    setCountry(val)
    form.setValue('country' as any, val)
  }

  async function onSubmit(data: any) {
    setIsLoading(true)
    const { error } = await signUp(data.email, data.password, data.name)
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message || t('val.required'),
      })
    } else {
      toast({
        title: t('success'),
        description:
          t('dashboard.welcome', { name: data.name }) + ' (Check your email)',
      })
      navigate('/login')
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full pb-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.start')}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormLabel>{t('team.role')}</FormLabel>
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
                        <span className="font-semibold">
                          {t('role.contractor')}
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
                        <span className="font-semibold">
                          {t('role.executor')}
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
                <FormLabel>Type</FormLabel>
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
                        <UserCircle className="h-4 w-4" /> Individual (PF)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pj" id="pj" />
                      <label
                        htmlFor="pj"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Building2 className="h-4 w-4" /> Company (PJ)
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {entityType === 'pj'
                      ? t('settings.form.company')
                      : t('settings.form.name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        entityType === 'pj' ? 'My Company LLC' : 'John Doe'
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
                  <FormLabel>{t('settings.form.email')}</FormLabel>
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
                    <FormLabel>{t('settings.form.phone')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('settings.placeholder.phone')}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            maskPhone(
                              e.target.value,
                              country === 'BR' ? 'pt' : 'en',
                            ),
                          )
                        }
                        maxLength={country === 'BR' ? 15 : 14}
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
                    <FormLabel>{t('settings.address.zip')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('settings.placeholder.zip')}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            maskZip(
                              e.target.value,
                              country === 'BR' ? 'pt' : 'en',
                            ),
                          )
                        }
                        maxLength={country === 'BR' ? 9 : 10}
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
                    <FormLabel>{t('settings.address.street')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Main St" {...field} />
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

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.address.neighborhood')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Downtown" {...field} />
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
                      <Input placeholder="Apt 101" {...field} />
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
                    <FormLabel>{t('settings.address.city')}</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
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
                      <Input placeholder="NY" {...field} />
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
                <h3 className="font-semibold">{t('settings.banking.title')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.banking.bank')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Chase" {...field} />
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
                      <FormLabel>{t('settings.banking.agency')}</FormLabel>
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
                      <FormLabel>{t('settings.banking.account')}</FormLabel>
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
                      <FormLabel>{t('settings.banking.doc')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Document" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('nav.start')}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm pt-6 pb-2">
        {t('auth.has_account')}{' '}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t('nav.login')}
        </Link>
      </div>
    </div>
  )
}
