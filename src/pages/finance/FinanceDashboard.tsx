import { useAuthStore } from '@/stores/useAuthStore'
import { usePaymentStore } from '@/stores/usePaymentStore'
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function FinanceDashboard() {
  const { user } = useAuthStore()
  const { getTransactionsByUser } = usePaymentStore()
  const { toast } = useToast()

  if (!user) return null

  const transactions = getTransactionsByUser(user.id)

  // Calculate Totals
  const totalEarnings = transactions
    .filter((t) => t.receiverId === user.id && t.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalSpent = transactions
    .filter((t) => t.payerId === user.id)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const pendingAmount = transactions
    .filter(
      (t) =>
        (t.receiverId === user.id || t.payerId === user.id) &&
        t.status === 'escrow',
    )
    .reduce((acc, curr) => acc + curr.amount, 0)

  const handleExport = () => {
    toast({
      title: 'Relatório Gerado',
      description: 'O download do relatório financeiro começará em instantes.',
    })
  }

  // Mock Data for Chart (Using dynamic data would require more complex grouping logic)
  const monthlyData = [
    { month: 'Jan', value: 2500 },
    { month: 'Fev', value: 3200 },
    { month: 'Mar', value: 4100 },
    { month: 'Abr', value: 3800 },
    { month: 'Mai', value: 5200 },
    { month: 'Jun', value: totalEarnings > 0 ? totalEarnings : 4800 }, // Show mock or real
  ]

  const chartConfig = {
    value: {
      label: 'Movimentação (R$)',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão Financeira
          </h1>
          <p className="text-muted-foreground">
            Painel financeiro para{' '}
            {user.role === 'executor' ? 'Recebimentos' : 'Pagamentos'}.
          </p>
        </div>
        <Button onClick={handleExport} className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" /> Exportar Relatório Mensal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'executor' ? 'Total Recebido' : 'Total Investido'}
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${' '}
              {(user.role === 'executor' ? totalEarnings : totalSpent).toFixed(
                2,
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Atualizado
              hoje
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Escrow (Retido)
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Liberação após conclusão
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${' '}
              {transactions.length > 0
                ? ((totalEarnings + totalSpent) / transactions.length).toFixed(
                    2,
                  )
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por transação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo Financeiro</CardTitle>
            <CardDescription>Histórico dos últimos 6 meses.</CardDescription>
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
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Extrato completo de movimentações.
            </CardDescription>
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
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {format(tx.date, 'dd/MM/yy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.jobTitle}
                      </TableCell>
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
                        {tx.status === 'escrow' && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            Escrow
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
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
