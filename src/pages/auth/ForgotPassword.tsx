import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('val.email')),
  })

  type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: ForgotPasswordForm) {
    setIsLoading(true)
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    toast({
      title: t('auth.forgot.sent'),
      description: t('auth.forgot.sent_desc'),
    })
  }

  return (
    <div className="space-y-6">
      <Link
        to="/login"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('auth.forgot.back')}
      </Link>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('auth.forgot.title')}
        </h1>
        <p className="text-muted-foreground">{t('auth.forgot.desc')}</p>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.forgot.send')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
