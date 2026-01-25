import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useJobStore } from '@/stores/useJobStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Gavel, Tag, MapPin, DollarSign } from 'lucide-react'

const jobSchema = z.object({
  title: z.string().min(5, 'Título muito curto'),
  description: z.string().min(20, 'Descreva melhor o serviço'),
  type: z.enum(['fixed', 'auction']),
  category: z.string().min(1, 'Selecione uma categoria'),
  location: z.string().min(3, 'Localização é obrigatória'),
  budget: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Valor deve ser maior que zero'),
})

type JobForm = z.infer<typeof jobSchema>

export default function PostJob() {
  const { addJob } = useJobStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'fixed',
      category: '',
      location: '',
      budget: 0,
    },
  })

  const onSubmit = (data: JobForm) => {
    if (!user) return

    addJob({
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      location: data.location,
      budget: data.budget,
      ownerId: user.id,
      ownerName: user.name,
    })

    toast({
      title: 'Job Publicado!',
      description: 'Seu serviço já está disponível para propostas.',
    })
    navigate('/my-jobs')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Publicar Novo Job</h1>
        <p className="text-muted-foreground">
          Descreva o que você precisa e encontre os melhores profissionais.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Serviço</CardTitle>
              <CardDescription>
                Informações básicas para os executores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Projeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Reforma do Banheiro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o escopo, materiais necessários, prazos, etc."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
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
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização (Cidade/UF)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="São Paulo, SP"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orçamento e Modelo</CardTitle>
              <CardDescription>
                Como você deseja pagar por este serviço.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Modelo de Contratação</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="fixed"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <Tag className="mb-3 h-6 w-6" />
                            <span className="font-semibold">Preço Fixo</span>
                            <span className="text-xs text-muted-foreground mt-1 text-center">
                              Defina um valor fechado para o projeto inteiro.
                            </span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="auction"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <Gavel className="mb-3 h-6 w-6" />
                            <span className="font-semibold">
                              Leilão / Bidding
                            </span>
                            <span className="text-xs text-muted-foreground mt-1 text-center">
                              Executores dão lances competitivos.
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <div className="relative max-w-[200px]">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          type="number"
                          placeholder="0.00"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      {form.watch('type') === 'auction'
                        ? 'Este será o valor máximo inicial sugerido.'
                        : 'Valor total oferecido pelo serviço.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg">
              Publicar Job
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
