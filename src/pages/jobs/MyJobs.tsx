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

  // Since a user can be both Contractor and Executor in a unified dual-role system,
  // we combine all activities related to this user into one view, categorized nicely.

  const myContractedJobs = jobs.filter((j) => j.ownerId === user.id)
  const myExecutedJobs = jobs.filter((j) =>
    j.bids.some((b) => b.executorId === user.id),
  )

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
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Minhas Atividades
          </h1>
          <p className="text-muted-foreground">
            Acompanhe vagas que você publicou ou nas quais você se candidatou.
          </p>
        </div>
        <Button asChild>
          <Link to="/post-job">
            <Plus className="mr-2 h-4 w-4" /> {t('dashboard.post_job')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs Publicados (Sou Contratante)</CardTitle>
        </CardHeader>
        <CardContent>
          {myContractedJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
              Nenhuma vaga publicada.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
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
                  {myContractedJobs.map((job) => (
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
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidaturas & Execução (Sou Profissional)</CardTitle>
        </CardHeader>
        <CardContent>
          {myExecutedJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
              Nenhuma candidatura enviada.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t('plans.field.title')}</TableHead>
                    <TableHead>Contratante</TableHead>
                    <TableHead>Minha Proposta</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myExecutedJobs.map((job) => {
                    const myBid = job.bids.find((b) => b.executorId === user.id)
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.title}
                        </TableCell>
                        <TableCell>{job.ownerName}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatCurrency(myBid?.amount || 0)}
                        </TableCell>
                        <TableCell>
                          {job.acceptedBidId === myBid?.id ? (
                            <Badge className="bg-green-500">
                              Aceito / Ativo
                            </Badge>
                          ) : job.acceptedBidId ? (
                            <Badge variant="destructive">Recusado</Badge>
                          ) : (
                            <Badge variant="secondary">Em Análise</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/jobs/${job.id}`}>
                              <Eye className="h-4 w-4 mr-1" /> {t('view')}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
