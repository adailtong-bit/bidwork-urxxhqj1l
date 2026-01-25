import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Briefcase, Building2, UserCircle } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
    role: z.enum(['contractor', 'executor']),
    entityType: z.enum(['pf', 'pj']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'contractor',
      entityType: 'pf',
    },
  })

  async function onSubmit(data: RegisterForm) {
    try {
      await registerUser(
        data.name,
        data.email,
        data.password,
        data.role,
        data.entityType,
      )
      toast({
        title: 'Conta criada!',
        description: `Bem-vindo ao BIDWORK como ${data.role === 'contractor' ? 'Contratante' : 'Executor'}.`,
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: 'Tente novamente mais tarde.',
      })
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Criar conta BIDWORK
        </h1>
        <p className="text-muted-foreground">
          Junte-se à nossa plataforma de serviços
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
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
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
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
                        <Building2 className="h-4 w-4" /> Pessoa Jurídica (CNPJ)
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo / Razão Social</FormLabel>
                <FormControl>
                  <Input placeholder="João Silva" {...field} />
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
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
                  <FormLabel>Confirmar</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        Já tem uma conta?{' '}
        <Link to="/" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </div>
    </div>
  )
}
