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
import { TestProfileSwitcher } from '@/components/TestProfileSwitcher'
import { useLanguageStore } from '@/stores/useLanguageStore'

const createLoginSchema = (t: any) =>
  z.object({
    email: z.string().email(t('val.email')),
    password: z.string().min(6, t('val.required')),
  })

export default function Login() {
  const { login, isLoading } = useAuthStore()
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
    try {
      await login(data.email, data.password)
      toast({
        title: t('success'),
        description: t('dashboard.welcome', { name: 'User' }),
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Login failed',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.login')}</h1>
        <p className="text-muted-foreground">
          {t('nav.start')} - {t('app.title')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t('auth.forgot.title')}
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
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('nav.login')}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
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
        {t('general.none')} account?{' '}
        <Link
          to="/register"
          className="font-semibold text-primary hover:underline"
        >
          {t('nav.start')}
        </Link>
      </div>

      <TestProfileSwitcher />
    </div>
  )
}
