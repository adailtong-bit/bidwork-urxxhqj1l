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

export default function MyJobs() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()

  if (!user) return null

  const isContractor = user.role === 'contractor'

  const myJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user.id)
    : jobs.filter((j) => j.bids.some((b) => b.executorId === user.id))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Aberto</Badge>
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Em Andamento</Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>
        )
      case 'dispute':
        return <Badge variant="destructive">Disputa</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isContractor ? 'Meus Jobs Publicados' : 'Minhas Candidaturas'}
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e acompanhe o status.
          </p>
        </div>
        {isContractor && (
          <Button asChild>
            <Link to="/post-job">
              <Plus className="mr-2 h-4 w-4" /> Novo Job
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          {myJobs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Você ainda não tem jobs{' '}
              {isContractor ? 'publicados' : 'em andamento'}.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lances</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.category}</TableCell>
                    <TableCell>
                      R$ {job.budget.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{job.bids.length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/jobs/${job.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> Detalhes
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
