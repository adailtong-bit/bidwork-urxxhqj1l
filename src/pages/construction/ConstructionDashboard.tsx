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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  HardHat,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  PieChart,
} from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ConstructionDashboard() {
  const { projects } = useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const activeProjects = projects.filter((p) => p.status === 'in_progress')
  const completedProjects = projects.filter((p) => p.status === 'completed')

  const totalBudget = projects.reduce((acc, p) => acc + p.totalBudget, 0)
  const totalSpent = projects.reduce((acc, p) => acc + p.totalSpent, 0)

  // Calculate variances for completed projects
  const finishedProjectStats = completedProjects.map((p) => {
    const plannedDays = differenceInDays(p.endDate, p.startDate)
    // Mock actual end date if not present (using last stage actualEndDate or just endDate)
    const actualEnd = p.stages[p.stages.length - 1]?.actualEndDate || p.endDate
    const actualDays = differenceInDays(actualEnd, p.startDate)

    const plannedMat = p.stages.reduce((acc, s) => acc + s.budgetMaterial, 0)
    const actualMat = p.stages.reduce((acc, s) => acc + s.actualMaterial, 0)

    return {
      name: p.name,
      plannedDays,
      actualDays,
      timeVariance: actualDays - plannedDays,
      plannedMat,
      actualMat,
      matVariance: actualMat - plannedMat,
    }
  })

  // For active projects (mock data for visualization if none completed)
  const analyticsData =
    finishedProjectStats.length > 0
      ? finishedProjectStats
      : [
          {
            name: 'Residencial Beta (Mock)',
            plannedDays: 120,
            actualDays: 135,
            timeVariance: 15,
            plannedMat: 50000,
            actualMat: 55000,
            matVariance: 5000,
          },
        ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('construction.dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('construction.dashboard.desc')}
          </p>
        </div>
        <Button asChild>
          <Link to="/construction/projects/new">
            <Plus className="mr-2 h-4 w-4" /> {t('construction.new_project')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('construction.active_projects')}
            </CardTitle>
            <HardHat className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('construction.total_projects', { count: projects.length })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('construction.global_budget')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget)}
            </div>
            <div className="text-xs text-muted-foreground flex justify-between mt-1">
              <span>
                {t('construction.executed')}: {formatCurrency(totalSpent)}
              </span>
              <span>
                {totalBudget > 0
                  ? ((totalSpent / totalBudget) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('construction.alerts')}
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

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />{' '}
            {t('construction.analysis')}
          </CardTitle>
          <CardDescription>{t('construction.analysis_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Tempo Planejado</TableHead>
                <TableHead>Tempo Real</TableHead>
                <TableHead>Desvio (Dias)</TableHead>
                <TableHead>Material Planejado</TableHead>
                <TableHead>Material Real</TableHead>
                <TableHead>Desvio (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.plannedDays} dias</TableCell>
                  <TableCell>{d.actualDays} dias</TableCell>
                  <TableCell
                    className={
                      d.timeVariance > 0
                        ? 'text-red-500 font-bold'
                        : 'text-green-600'
                    }
                  >
                    {d.timeVariance > 0 ? `+${d.timeVariance}` : d.timeVariance}
                  </TableCell>
                  <TableCell>{formatCurrency(d.plannedMat)}</TableCell>
                  <TableCell>{formatCurrency(d.actualMat)}</TableCell>
                  <TableCell
                    className={
                      d.matVariance > 0
                        ? 'text-red-500 font-bold'
                        : 'text-green-600'
                    }
                  >
                    {d.matVariance > 0
                      ? `+${formatCurrency(d.matVariance)}`
                      : d.matVariance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">
          {t('construction.my_projects')}
        </h2>
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
                      {t('construction.financial_progress')}
                    </span>
                    <span className="font-medium">
                      {project.totalBudget > 0
                        ? (
                            (project.totalSpent / project.totalBudget) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      project.totalBudget > 0
                        ? (project.totalSpent / project.totalBudget) * 100
                        : 0
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">
                      {t('construction.start')}
                    </span>
                    <span className="font-medium">
                      {formatDate(project.startDate, 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">
                      {t('construction.local')}
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
                    {t('construction.manage')}{' '}
                    <ArrowRight className="ml-2 h-4 w-4" />
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
