import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowRight, Building2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useLanguageStore } from '@/stores/useLanguageStore'

const createLoginSchema = (t: any) =>
  z.object({
    email: z.string().email(t('val.email') || 'Email inválido'),
    password: z.string().min(6, t('val.required') || 'Campo obrigatório'),
  })

export default function Login() {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const form = useForm({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: any) {
    setIsLoading(true)
    const { error } = await signIn(data.email, data.password)
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Erro',
        description: error.message || 'Credenciais inválidas.',
      })
    } else {
      toast({
        title: t('success') || 'Sucesso',
        description: 'Login realizado com sucesso.',
      })
      navigate('/dashboard')
    }
  }

  return (
    <div className="space-y-6 w-full max-w-[380px] mx-auto px-4">
      <div className="flex flex-col items-center space-y-2 text-center mb-8">
        <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-2">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Acesso Seguro
        </h1>
        <p className="text-muted-foreground text-sm">
          Acesse o painel integrado de Gestão de Obras, Máquinas e Compras.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail Corporativo</FormLabel>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Senha</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                  >
                    Forgot Password? (Esqueci a Senha)
                  </Link>
                </div>
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

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Lembrar de mim
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-5 w-5" />
            )}
            Entrar
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm pt-4 border-t border-border/50">
        <span className="text-muted-foreground">Ainda não possui acesso?</span>{' '}
        <Link
          to="/register"
          className="font-bold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
        >
          Create Account (Criar Conta)
        </Link>
      </div>
    </div>
  )
}
