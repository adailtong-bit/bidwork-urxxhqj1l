import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Globe, Briefcase, DollarSign } from 'lucide-react'

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  subCategory: z.string().min(1, 'Please select a subcategory'),
  type: z.enum(['donation', 'service', 'job']),
  price: z.string().optional(),
  pricingType: z.string().optional(),
  phone: z.string().min(14, 'Phone number must be fully formatted'),
})

type JobFormValues = z.infer<typeof jobSchema>

const CATEGORIES = {
  en: [
    { id: 'construction', name: 'Construction & Remodeling' },
    { id: 'technology', name: 'IT & Technology' },
    { id: 'maintenance', name: 'Home Maintenance' },
  ],
  pt: [
    { id: 'construction', name: 'Construção & Reformas' },
    { id: 'technology', name: 'TI & Tecnologia' },
    { id: 'maintenance', name: 'Manutenção Residencial' },
  ],
}

const SUBCATEGORIES: Record<string, { en: any[]; pt: any[] }> = {
  construction: {
    en: [
      { id: 'plumbing', name: 'Plumbing' },
      { id: 'electrical', name: 'Electrical' },
      { id: 'painting', name: 'Painting' },
    ],
    pt: [
      { id: 'plumbing', name: 'Encanamento' },
      { id: 'electrical', name: 'Elétrica' },
      { id: 'painting', name: 'Pintura' },
    ],
  },
  technology: {
    en: [
      { id: 'web', name: 'Web Development' },
      { id: 'support', name: 'Tech Support' },
    ],
    pt: [
      { id: 'web', name: 'Desenvolvimento Web' },
      { id: 'support', name: 'Suporte Técnico' },
    ],
  },
  maintenance: {
    en: [
      { id: 'cleaning', name: 'House Cleaning' },
      { id: 'landscaping', name: 'Landscaping' },
    ],
    pt: [
      { id: 'cleaning', name: 'Limpeza Residencial' },
      { id: 'landscaping', name: 'Jardinagem' },
    ],
  },
}

const formatUSPhone = (val: string) => {
  const cleaned = ('' + val).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{0,3})?(\d{0,3})?(\d{0,4})?/)
  if (!match) return val
  if (!match[2]) return match[1] ? `(${match[1]}` : ''
  if (!match[3]) return `(${match[1]}) ${match[2]}`
  return `(${match[1]}) ${match[2]}-${match[3]}`
}

export default function PostJob() {
  const [lang, setLang] = useState<'en' | 'pt'>('en')
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subCategory: '',
      type: 'service',
      price: '',
      pricingType: 'fixed',
      phone: '',
    },
  })

  const watchType = form.watch('type')
  const watchCategory = form.watch('category')

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call to Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('Job Data to save:', data)

      toast({
        title: lang === 'en' ? 'Success!' : 'Sucesso!',
        description:
          lang === 'en'
            ? 'Your post has been published successfully.'
            : 'Sua publicação foi criada com sucesso.',
      })
      form.reset({
        ...data,
        title: '',
        description: '',
        price: '',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: lang === 'en' ? 'Error' : 'Erro',
        description:
          lang === 'en' ? 'Failed to post job.' : 'Falha ao publicar.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUSPhone(e.target.value)
    form.setValue('phone', formatted, { shouldValidate: true })
  }

  return (
    <div className="container max-w-3xl py-12 mx-auto px-4 sm:px-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            {lang === 'en' ? 'Create a Listing' : 'Criar um Anúncio'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {lang === 'en'
              ? 'Offer a service, post a job, or make a donation.'
              : 'Ofereça um serviço, publique uma vaga ou faça uma doação.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border">
          <Globe className="h-4 w-4 text-muted-foreground ml-2" />
          <Select
            value={lang}
            onValueChange={(val: 'en' | 'pt') => setLang(val)}
          >
            <SelectTrigger className="w-[120px] h-8 border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="pt">Português (BR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Type Section */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {lang === 'en' ? 'Listing Type' : 'Tipo de Anúncio'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="service">
                          {lang === 'en'
                            ? 'Offer a Service'
                            : 'Oferecer um Serviço'}
                        </SelectItem>
                        <SelectItem value="job">
                          {lang === 'en'
                            ? 'Post a Job / Hiring'
                            : 'Publicar Vaga / Contratação'}
                        </SelectItem>
                        <SelectItem value="donation">
                          {lang === 'en'
                            ? 'Make a Donation'
                            : 'Fazer uma Doação'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchType === 'service' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 border rounded-lg bg-primary/5 animate-fade-in border-primary/20">
                  <FormField
                    control={form.control}
                    name="pricingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {lang === 'en'
                            ? 'Pricing Model'
                            : 'Modelo de Cobrança'}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  lang === 'en'
                                    ? 'Select pricing type'
                                    : 'Selecione o modelo'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hourly">
                              {lang === 'en' ? 'Hourly Rate' : 'Valor por Hora'}
                            </SelectItem>
                            <SelectItem value="fixed">
                              {lang === 'en' ? 'Fixed Price' : 'Preço Fixo'}
                            </SelectItem>
                            <SelectItem value="negotiable">
                              {lang === 'en'
                                ? 'Negotiable / Request Quote'
                                : 'Negociável / Sob Orçamento'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {lang === 'en'
                            ? 'Estimated Price (USD)'
                            : 'Preço Estimado (USD)'}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {lang === 'en'
                            ? 'Leave empty if purely negotiable'
                            : 'Deixe em branco se for negociável'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="h-px w-full bg-border" />

            {/* General Info Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                {lang === 'en' ? 'General Information' : 'Informações Gerais'}
              </h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Title' : 'Título'}</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        placeholder={
                          lang === 'en'
                            ? 'E.g. Professional Plumbing Services'
                            : 'Ex. Serviços Profissionais de Encanamento'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {lang === 'en' ? 'Category' : 'Categoria'}
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val)
                          form.setValue('subCategory', '')
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                lang === 'en'
                                  ? 'Select a category'
                                  : 'Selecione uma categoria'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES[lang].map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {lang === 'en' ? 'Subcategory' : 'Subcategoria'}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!watchCategory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                lang === 'en'
                                  ? 'Select a subcategory'
                                  : 'Selecione uma subcategoria'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {watchCategory &&
                            SUBCATEGORIES[watchCategory]?.[lang]?.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {lang === 'en'
                        ? 'Contact Phone (US Format)'
                        : 'Telefone de Contato (Formato US)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(555) 555-5555"
                        {...field}
                        onChange={handlePhoneChange}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormDescription>
                      {lang === 'en'
                        ? 'Phone will be automatically formatted.'
                        : 'O telefone será formatado automaticamente.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {lang === 'en' ? 'Description' : 'Descrição'}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] resize-y"
                        placeholder={
                          lang === 'en'
                            ? 'Provide details about your listing...'
                            : 'Forneça detalhes sobre seu anúncio...'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? lang === 'en'
                  ? 'Publishing...'
                  : 'Publicando...'
                : lang === 'en'
                  ? 'Publish Listing'
                  : 'Publicar Anúncio'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
