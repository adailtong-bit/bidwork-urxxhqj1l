import { usePlanStore } from '@/stores/usePlanStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  active: {
    label: 'Ativos',
    color: 'hsl(var(--chart-1))',
  },
  completed: {
    label: 'Concluídos',
    color: 'hsl(var(--chart-2))',
  },
}

const data = [
  { month: 'Jan', active: 10, completed: 5 },
  { month: 'Fev', active: 15, completed: 8 },
  { month: 'Mar', active: 20, completed: 12 },
  { month: 'Abr', active: 18, completed: 15 },
  { month: 'Mai', active: 25, completed: 20 },
  { month: 'Jun', active: 30, completed: 22 },
  { month: 'Jul', active: 35, completed: 28 },
]

export default function Dashboard() {
  const { plans } = usePlanStore()

  const stats = [
    {
      title: 'Total de Planos',
      value: plans.length,
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Projetos Ativos',
      value: plans.filter((p) => p.status === 'Em Progresso').length,
      change: '+5%',
      trend: 'up',
    },
    { title: 'Metas Concluídas', value: '85', change: '+24%', trend: 'up' },
    { title: 'Orçamento (R$)', value: '250k', change: '-2%', trend: 'down' },
  ]

  const recentPlans = [...plans]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/plans/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Plano
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span
                  className={
                    stat.trend === 'up'
                      ? 'text-emerald-500 mr-1'
                      : 'text-rose-500 mr-1'
                  }
                >
                  {stat.change}
                </span>
                em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Crescimento de Planos</CardTitle>
            <CardDescription>
              Evolução de planos ativos vs concluídos nos últimos 7 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#fillActive)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#fillCompleted)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Planos Recentes</CardTitle>
            <CardDescription>
              Você tem {plans.length} planos totais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{plan.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {plan.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          plan.status === 'Concluído'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                            : plan.status === 'Atrasado'
                              ? 'bg-rose-100 text-rose-800 hover:bg-rose-100'
                              : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
                        }
                      >
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {plan.progress}%
                        </span>
                        <Progress
                          value={plan.progress}
                          className="w-[60px] h-2"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
