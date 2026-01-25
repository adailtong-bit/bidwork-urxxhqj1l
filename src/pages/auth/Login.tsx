import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Github } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginForm) {
    try {
      await login(data.email, data.password)
      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description: 'Verifique suas credenciais e tente novamente.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo de volta
        </h1>
        <p className="text-muted-foreground">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seunome@empresa.com" {...field} />
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
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Lembrar de mim
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continue com
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full"
        disabled={isLoading}
      >
        <Github className="mr-2 h-4 w-4" />
        Github
      </Button>

      <div className="text-center text-sm">
        Não tem uma conta?{' '}
        <Link
          to="/register"
          className="font-semibold text-primary hover:underline"
        >
          Cadastre-se
        </Link>
      </div>
    </div>
  )
}
