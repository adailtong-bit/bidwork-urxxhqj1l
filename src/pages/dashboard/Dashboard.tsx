import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Search,
  Star,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { AINotifications } from '@/components/AINotifications'
import { AdSection } from '@/components/AdSection'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()
  const { t, formatCurrency } = useLanguageStore()

  const isContractor = user?.role === 'contractor'

  const activeJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user?.id && j.status === 'in_progress')
        .length
    : jobs.filter(
        (j) =>
          j.bids.some((b) => b.executorId === user?.id) &&
          j.status === 'in_progress',
      ).length

  const completedJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user?.id && j.status === 'completed')
        .length
    : jobs.filter(
        (j) =>
          j.bids.some((b) => b.executorId === user?.id) &&
          j.status === 'completed',
      ).length

  const earningsData = [
    { month: t('dashboard.months.jan'), value: 1200 },
    { month: t('dashboard.months.feb'), value: 1900 },
    { month: t('dashboard.months.mar'), value: 1500 },
    { month: t('dashboard.months.apr'), value: 2200 },
    { month: t('dashboard.months.may'), value: 2800 },
  ]

  const marketInsightsData = [
    { category: 'TI', avgPrice: 2500 },
    { category: 'Design', avgPrice: 1200 },
    { category: 'Reformas', avgPrice: 1800 },
    { category: 'Mkt', avgPrice: 1500 },
  ]

  const chartConfig = {
    value: {
      label: t('dashboard.chart.label.value'),
      color: 'hsl(var(--primary))',
    },
    avgPrice: {
      label: t('dashboard.chart.label.avg_price'),
      color: 'hsl(var(--chart-2))',
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('dashboard.welcome', { name: user?.name || '' })}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.role_label', {
              role: isContractor ? t('role.contractor') : t('role.executor'),
            })}{' '}
            |{' '}
            <span className="font-semibold text-primary capitalize">
              {t('dashboard.plan_label', {
                plan: user?.subscriptionTier || '',
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isContractor ? (
            <Button asChild>
              <Link to="/post-job">
                <Plus className="mr-2 h-4 w-4" /> {t('dashboard.post_job')}
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/find-jobs">
                <Search className="mr-2 h-4 w-4" /> {t('dashboard.find_jobs')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <AINotifications />

      <AdSection segment="dashboard" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.reputation')}
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.reputation.toFixed(1)}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.jobs_finished', { count: completedJobs })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.active_jobs')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.active_jobs_desc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isContractor
                ? t('dashboard.total_spent')
                : t('dashboard.total_earned')}
            </CardTitle>
            <Wallet className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(9600)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />{' '}
              {t('dashboard.escrow_protected')}
            </p>
          </CardContent>
        </Card>

        {user?.role === 'executor' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.credits')}
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.credits}</div>
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-primary"
                asChild
              >
                <Link to="/credits">{t('dashboard.buy_more')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {isContractor
                ? t('dashboard.chart.spent')
                : t('dashboard.chart.earnings')}
            </CardTitle>
            <CardDescription>{t('dashboard.chart.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <LineChart data={earningsData}>
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
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    stroke="var(--color-value)"
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.market_insights')}</CardTitle>
            <CardDescription>
              {t('dashboard.market_insights_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart data={marketInsightsData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="avgPrice"
                    fill="var(--color-avgPrice)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
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
