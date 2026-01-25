import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const data = [
  { name: 'Jan', vendas: 4000, mkt: 2400 },
  { name: 'Fev', vendas: 3000, mkt: 1398 },
  { name: 'Mar', vendas: 2000, mkt: 9800 },
  { name: 'Abr', vendas: 2780, mkt: 3908 },
  { name: 'Mai', vendas: 1890, mkt: 4800 },
  { name: 'Jun', vendas: 2390, mkt: 3800 },
]

const chartConfig = {
  vendas: {
    label: 'Vendas',
    color: 'hsl(var(--chart-1))',
  },
  mkt: {
    label: 'Marketing',
    color: 'hsl(var(--chart-2))',
  },
}

export default function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Relatórios de Desempenho
      </h1>
      <p className="text-muted-foreground">
        Análise detalhada do progresso da empresa.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Investimento vs Retorno</CardTitle>
            <CardDescription>Comparativo semestral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={data}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="vendas"
                    fill="var(--color-vendas)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="mkt"
                    fill="var(--color-mkt)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
