import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuth } from '@/hooks/use-auth'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword, verifyOtp, updatePassword } = useAuth()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const navigate = useNavigate()

  const emailSchema = z.object({
    email: z.string().email(t('val.email') || 'Email inválido'),
  })

  const passwordSchema = z
    .object({
      password: z.string().min(6, t('val.required') || 'Mínimo 6 caracteres'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Senhas não coincidem',
      path: ['confirmPassword'],
    })

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsLoading(true)
    setEmail(data.email)
    const { error } = await resetPassword(data.email)
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } else {
      toast({
        title: 'Código Enviado',
        description: 'Verifique seu e-mail ou celular.',
      })
      setStep(2)
    }
  }

  async function onVerifyOtp() {
    if (otp.length !== 6) return
    setIsLoading(true)
    const { error } = await verifyOtp(email, otp)
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Código inválido ou expirado.',
      })
    } else {
      toast({
        title: 'Código verificado',
        description: 'Agora crie uma nova senha.',
      })
      setStep(3)
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
    setIsLoading(true)
    const { error } = await updatePassword(data.password)
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } else {
      toast({ title: 'Sucesso', description: 'Senha atualizada com sucesso!' })
      navigate('/login')
    }
  }

  return (
    <div className="space-y-6 w-full max-w-[380px] mx-auto px-4">
      <Link
        to="/login"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('auth.forgot.back')}
      </Link>

      <div className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4">
          {step === 3 ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <KeyRound className="h-6 w-6" />
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {step === 1 && t('auth.forgot.title')}
          {step === 2 && 'Verificar Código'}
          {step === 3 && 'Nova Senha'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === 1 && t('auth.forgot.desc')}
          {step === 2 && `Digite o código de 6 dígitos enviado para ${email}`}
          {step === 3 && 'Crie uma nova senha segura para o seu acesso.'}
        </p>
      </div>

      {step === 1 && (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      {...field}
                      className="bg-background h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {t('auth.forgot.send')}
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <div className="space-y-6 flex flex-col items-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={onVerifyOtp}
            className="w-full h-11"
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Confirmar Código
          </Button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-primary hover:underline"
          >
            Tentar outro e-mail
          </button>
        </div>
      )}

      {step === 3 && (
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-background h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-background h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Salvar e Entrar
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
