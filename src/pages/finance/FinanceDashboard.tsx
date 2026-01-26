import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Download,
  Wallet,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function FinanceDashboard() {
  const { user } = useAuthStore()
  const { toast } = useToast()

  if (!user || user.role !== 'executor') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        Acesso restrito a Executores.
      </div>
    )
  }

  const handleExport = () => {
    toast({
      title: 'Relatório Gerado',
      description: 'O download do relatório financeiro começará em instantes.',
    })
  }

  // Mock Data
  const monthlyData = [
    { month: 'Jan', earnings: 2500, pending: 500 },
    { month: 'Fev', earnings: 3200, pending: 800 },
    { month: 'Mar', earnings: 4100, pending: 200 },
    { month: 'Abr', earnings: 3800, pending: 1200 },
    { month: 'Mai', earnings: 5200, pending: 0 },
    { month: 'Jun', earnings: 4800, pending: 600 },
  ]

  const chartConfig = {
    earnings: {
      label: 'Recebimentos (R$)',
      color: 'hsl(var(--primary))',
    },
    pending: {
      label: 'Pendente (R$)',
      color: 'hsl(var(--chart-2))',
    },
  }

  const transactions = [
    {
      id: 'tx1',
      date: '15/06/2024',
      desc: 'Desenvolvimento App React Native',
      amount: 4800,
      status: 'completed',
    },
    {
      id: 'tx2',
      date: '22/06/2024',
      desc: 'Manutenção Servidor',
      amount: 600,
      status: 'pending',
    },
    {
      id: 'tx3',
      date: '28/06/2024',
      desc: 'Consultoria Técnica',
      amount: 1200,
      status: 'processing',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão Financeira
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seus ganhos, pagamentos pendentes e extratos.
          </p>
        </div>
        <Button onClick={handleExport} className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" /> Exportar Relatório Mensal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 23.600,00</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> +12% vs mês
              anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.800,00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Liberação prevista em 5 dias
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 2.450,00</div>
            <p className="text-xs text-muted-foreground mt-1">Por projeto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>
              Comparativo de receitas e valores pendentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart data={monthlyData}>
                  <XAxis
                    dataKey="month"
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
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="earnings"
                    fill="var(--color-earnings)"
                    radius={[4, 4, 0, 0]}
                    name="Recebido"
                  />
                  <Bar
                    dataKey="pending"
                    fill="var(--color-pending)"
                    radius={[4, 4, 0, 0]}
                    name="Pendente"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
            <CardDescription>Últimas transações na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell className="font-medium">{tx.desc}</TableCell>
                    <TableCell>R$ {tx.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {tx.status === 'completed' && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800"
                        >
                          Pago
                        </Badge>
                      )}
                      {tx.status === 'pending' && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Pendente
                        </Badge>
                      )}
                      {tx.status === 'processing' && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Processando
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver extrato completo <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
