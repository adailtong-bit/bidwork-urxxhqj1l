import { useProjectStore } from '@/stores/useProjectStore'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  HardHat,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ConstructionDashboard() {
  const { projects } = useProjectStore()

  const activeProjects = projects.filter((p) => p.status === 'in_progress')
  const totalBudget = projects.reduce((acc, p) => acc + p.totalBudget, 0)
  const totalSpent = projects.reduce((acc, p) => acc + p.totalSpent, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Obras</h1>
          <p className="text-muted-foreground">
            Controle total de projetos, custos e cronogramas.
          </p>
        </div>
        <Button asChild>
          <Link to="/construction/projects/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Projeto
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Obras em Andamento
            </CardTitle>
            <HardHat className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} projetos totais
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orçamento Global
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalBudget.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-muted-foreground flex justify-between mt-1">
              <span>Executado: R$ {totalSpent.toLocaleString('pt-BR')}</span>
              <span>{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={(totalSpent / totalBudget) * 100}
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas de Cronograma
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Fase de acabamento atrasada em Residencial Alpha
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Meus Projetos</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="flex flex-col hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      project.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : project.status === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {project.status === 'in_progress'
                      ? 'Em Andamento'
                      : project.status === 'completed'
                        ? 'Concluído'
                        : project.status === 'planning'
                          ? 'Planejamento'
                          : 'Pausado'}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Progresso Financeiro
                    </span>
                    <span className="font-medium">
                      {(
                        (project.totalSpent / project.totalBudget) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(project.totalSpent / project.totalBudget) * 100}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">
                      Início
                    </span>
                    <span className="font-medium">
                      {format(project.startDate, 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">
                      Local
                    </span>
                    <span className="font-medium truncate block">
                      {project.location}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild className="w-full" variant="outline">
                  <Link to={`/construction/projects/${project.id}`}>
                    Gerenciar Obra <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
