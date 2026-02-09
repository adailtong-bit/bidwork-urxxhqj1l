import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Plus } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function MyJobs() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()
  const { t, formatCurrency } = useLanguageStore()

  if (!user) return null

  const isContractor = user.role === 'contractor'

  const myJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user.id)
    : jobs.filter((j) => j.bids.some((b) => b.executorId === user.id))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">{t('status.open')}</Badge>
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            {t('status.in_progress')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {t('status.completed')}
          </Badge>
        )
      case 'dispute':
        return <Badge variant="destructive">{t('status.dispute')}</Badge>
      default:
        return <Badge variant="outline">{t(`status.${status}`)}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isContractor ? t('sidebar.my_jobs') : t('sidebar.applications')}
          </h1>
          <p className="text-muted-foreground">
            {t('proj.partner.manage_activities')}
          </p>
        </div>
        {isContractor && (
          <Button asChild>
            <Link to="/post-job">
              <Plus className="mr-2 h-4 w-4" /> {t('dashboard.post_job')}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('nav.projects')}</CardTitle>
        </CardHeader>
        <CardContent>
          {myJobs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {t('plans.empty_desc')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('plans.field.title')}</TableHead>
                  <TableHead>{t('plans.field.category')}</TableHead>
                  <TableHead>{t('job.budget')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('job.proposals')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.category}</TableCell>
                    <TableCell>{formatCurrency(job.budget)}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.bids.length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/jobs/${job.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> {t('view')}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
