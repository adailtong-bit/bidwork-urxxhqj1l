import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Download,
  Wallet,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  Plus,
  Lock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CurrencyInput } from '@/components/CurrencyInput'

export default function FinanceDashboard() {
  const { user } = useAuthStore()
  const { getTransactionsByUser, schedulePayment, getScheduledPayments } =
    usePaymentStore()
  const { toast } = useToast()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    title: '',
    amount: 0,
    date: '',
  })

  if (!user) return null

  // Role-Based Access Control
  const hasTeamRole = !!user.teamRole
  const canAccess =
    !hasTeamRole || ['Admin', 'Accountant'].includes(user.teamRole || '')

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <Lock className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">{t('access.restricted.title')}</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {t('access.restricted.desc')}
        </p>
        <Button asChild>
          <Link to="/dashboard">{t('back')}</Link>
        </Button>
      </div>
    )
  }

  const isPJ = user.entityType === 'pj'
  const transactions = getTransactionsByUser(user.id)
  const scheduled = getScheduledPayments(user.id)

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

  // Mock Cash Flow Data
  const cashFlowData = [
    { month: t('dashboard.months.jan'), entrada: 4000, saida: 2400 },
    { month: t('dashboard.months.feb'), entrada: 3000, saida: 1398 },
    { month: t('dashboard.months.mar'), entrada: 2000, saida: 9800 },
    { month: t('dashboard.months.apr'), entrada: 2780, saida: 3908 },
    { month: t('dashboard.months.may'), entrada: 1890, saida: 4800 },
    { month: t('dashboard.months.jun'), entrada: 2390, saida: 3800 },
    { month: t('dashboard.months.jul'), entrada: 3490, saida: 4300 },
  ]

  const chartConfig = {
    entrada: {
      label: t('finance.chart.income'),
      color: 'hsl(var(--primary))',
    },
    saida: {
      label: t('finance.chart.expenses'),
      color: 'hsl(var(--destructive))',
    },
  }

  const handleSchedule = () => {
    schedulePayment(
      {
        jobTitle: scheduleData.title,
        payerId: user.id,
        payerName: user.name,
        receiverId: 'mock-receiver',
        receiverName: 'Fornecedor Externo',
        amount: scheduleData.amount,
        category: 'other',
      },
      new Date(scheduleData.date),
    )

    setIsScheduleOpen(false)
    toast({ title: t('finance.scheduled') })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPJ ? t('finance.management_corporate') : t('finance.management')}
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'executor'
              ? t('finance.desc_receivables')
              : t('finance.desc_payments')}
          </p>
        </div>
        <div className="flex gap-2">
          {isPJ && (
            <Button variant="outline" asChild>
              <Link to="/finance/accounting">
                <Download className="mr-2 h-4 w-4" /> {t('sidebar.accounting')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'executor'
                ? t('finance.total_received')
                : t('finance.total_invested')}
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                user.role === 'executor' ? totalEarnings : totalSpent,
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />{' '}
              {t('finance.updated_today')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('finance.escrow_held')}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('finance.release_after')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('finance.ticket_avg')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                transactions.length > 0
                  ? (totalEarnings + totalSpent) / transactions.length
                  : 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('finance.per_transaction')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('finance.overview')}</TabsTrigger>
          {isPJ && (
            <TabsTrigger value="cashflow">
              {t('finance.cashflow')} (Advanced)
            </TabsTrigger>
          )}
          <TabsTrigger value="scheduled">{t('finance.scheduled')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('finance.simple_flow')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={chartConfig}
                    className="w-full h-full"
                  >
                    <BarChart data={cashFlowData.slice(0, 6)}>
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
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        }
                      />
                      <Bar
                        dataKey={user.role === 'executor' ? 'entrada' : 'saida'}
                        fill="var(--color-entrada)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('finance.recent_transactions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('finance.description')}</TableHead>
                      <TableHead>{t('finance.value')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.slice(0, 5).map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {formatDate(tx.date, 'dd/MM/yy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {tx.jobTitle}
                          </TableCell>
                          <TableCell>{formatCurrency(tx.amount)}</TableCell>
                          <TableCell>
                            {tx.status === 'completed' && (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-800"
                              >
                                {t('status.paid')}
                              </Badge>
                            )}
                            {tx.status === 'pending' && (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800"
                              >
                                {t('status.pending')}
                              </Badge>
                            )}
                            {tx.status === 'escrow' && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                {t('status.escrow')}
                              </Badge>
                            )}
                            {tx.status === 'scheduled' && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800"
                              >
                                {t('status.scheduled')}
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
                          {t('finance.empty_transactions')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.projected_flow')}</CardTitle>
              <CardDescription>{t('finance.comparative_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Area
                      dataKey="saida"
                      type="natural"
                      fill="var(--color-saida)"
                      fillOpacity={0.4}
                      stroke="var(--color-saida)"
                      stackId="a"
                    />
                    <Area
                      dataKey="entrada"
                      type="natural"
                      fill="var(--color-entrada)"
                      fillOpacity={0.4}
                      stroke="var(--color-entrada)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />{' '}
                  {t('finance.schedule_payment')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('finance.new_schedule')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>{t('finance.description')}</Label>
                    <Input
                      value={scheduleData.title}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Ex: Pagamento Fornecedor Aço"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('finance.value')}</Label>
                    <CurrencyInput
                      value={scheduleData.amount}
                      onChange={(val) =>
                        setScheduleData({
                          ...scheduleData,
                          amount: val,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('finance.date')}</Label>
                    <Input
                      value={scheduleData.date}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          date: e.target.value,
                        })
                      }
                      type="date"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSchedule}>
                    {t('finance.confirm_schedule')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('finance.future_payments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.date_scheduled')}</TableHead>
                    <TableHead>{t('finance.description')}</TableHead>
                    <TableHead>{t('finance.beneficiary')}</TableHead>
                    <TableHead>{t('finance.value')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduled.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-purple-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {tx.scheduledDate
                            ? formatDate(tx.scheduledDate, 'dd/MM/yyyy')
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{tx.jobTitle}</TableCell>
                      <TableCell>{tx.receiverName}</TableCell>
                      <TableCell>{formatCurrency(tx.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-purple-200 bg-purple-50 text-purple-700"
                        >
                          {t('status.scheduled')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {scheduled.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('finance.empty_scheduled')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
