import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlanStore } from '@/stores/usePlanStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LayoutGrid, List, Search, Plus, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PlansList() {
  const { plans } = usePlanStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Meus Planos</h1>
        <Button asChild>
          <Link to="/plans/new">
            <Plus className="mr-2 h-4 w-4" /> Criar Plano
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Em Progresso">Em Progresso</SelectItem>
              <SelectItem value="Planejamento">Planejamento</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-end mb-4">
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0">
          {filteredPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum plano encontrado</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Tente ajustar seus filtros ou crie um novo plano para começar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <Link to={`/plans/${plan.id}`} key={plan.id}>
                  <Card className="h-full hover:-translate-y-1 transition-transform cursor-pointer group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                          variant="outline"
                          className={
                            plan.status === 'Concluído'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : plan.status === 'Atrasado'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          }
                        >
                          {plan.status}
                        </Badge>
                        <Badge variant="secondary">{plan.category}</Badge>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {plan.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progresso
                            </span>
                            <span className="font-medium">
                              {plan.progress}%
                            </span>
                          </div>
                          <Progress value={plan.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{plan.owner}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(plan.deadline, 'dd MMM yyyy', {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {/* Table implementation could be here - simplified for this example as Grid is primary */}
              <div className="p-4 text-center text-muted-foreground">
                A visualização em lista está sendo implementada. Use a
                visualização em grade por enquanto.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
