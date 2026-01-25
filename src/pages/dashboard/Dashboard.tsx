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
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()

  const isContractor = user?.role === 'contractor'

  // Filter jobs based on role
  const activeJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user?.id && j.status === 'in_progress')
        .length
    : jobs.filter(
        (j) =>
          j.bids.some((b) => b.executorId === user?.id) &&
          j.status === 'in_progress',
      ).length

  const openJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user?.id && j.status === 'open').length
    : jobs.filter((j) => j.status === 'open').length // Total available jobs for executor

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Olá, {user?.name}
          </h2>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controle{' '}
            {isContractor ? '(Contratante)' : '(Executor)'}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isContractor ? (
            <Button asChild>
              <Link to="/post-job">
                <Plus className="mr-2 h-4 w-4" /> Publicar Novo Job
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/find-jobs">
                <Search className="mr-2 h-4 w-4" /> Buscar Jobs
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputação</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.reputation.toFixed(1)}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em avaliações recentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isContractor ? 'Jobs Ativos' : 'Trabalhos em Andamento'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Projetos em execução agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isContractor ? 'Jobs Abertos' : 'Oportunidades'}
            </CardTitle>
            <Search className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs}</div>
            <p className="text-xs text-muted-foreground">
              {isContractor ? 'Aguardando propostas' : 'Disponíveis para lance'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo em Escrow
            </CardTitle>
            <Wallet className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Protegido pelo BIDWORK
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Suas últimas interações na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <p>Nenhuma atividade recente encontrada.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>
              Dicas de {isContractor ? 'Contratação' : 'Sucesso'}
            </CardTitle>
            <CardDescription>Melhore sua experiência.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm">
              {isContractor ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <span>
                      Descreva seu projeto com detalhes para atrair melhores
                      propostas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <span>
                      Verifique a reputação dos executores antes de aceitar.
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <span>
                      Complete seu perfil para aumentar sua credibilidade.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <span>Envie propostas personalizadas e competitivas.</span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
