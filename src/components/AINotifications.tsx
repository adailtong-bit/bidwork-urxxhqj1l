import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, UserCheck, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'

export function AINotifications() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()

  if (!user) return null

  // Mock AI Recommendations based on role
  const isExecutor = user.role === 'executor'

  // Filter jobs for executor with high match score
  const recommendedJobs = isExecutor
    ? jobs
        .filter(
          (j) =>
            j.status === 'open' &&
            j.smartMatchScore &&
            j.smartMatchScore > 85 &&
            j.category === user.category,
        )
        .slice(0, 3)
    : []

  // Mock candidates for Contractor
  const recommendedCandidates = !isExecutor
    ? [
        {
          id: 'c1',
          name: 'Ana Silva',
          role: 'Dev Fullstack',
          match: 98,
          reputation: 5.0,
        },
        {
          id: 'c2',
          name: 'Carlos Tech',
          role: 'Especialista React',
          match: 92,
          reputation: 4.8,
        },
      ]
    : []

  if (isExecutor && recommendedJobs.length === 0) return null
  if (!isExecutor && recommendedCandidates.length === 0) return null

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="h-5 w-5 text-purple-600 fill-purple-200" />
          Recomendações via IA
        </CardTitle>
        <CardDescription>
          Seleção inteligente baseada no seu perfil e histórico.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isExecutor
          ? recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-2 p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-100"
                  >
                    {job.smartMatchScore}% Match
                  </Badge>
                  <span className="text-xs text-muted-foreground font-semibold">
                    R$ {job.budget}
                  </span>
                </div>
                <h4 className="font-semibold text-sm line-clamp-1">
                  {job.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-auto w-full text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                  asChild
                >
                  <Link to={`/jobs/${job.id}`}>
                    Ver Job <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ))
          : recommendedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-col gap-2 p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-100"
                  >
                    {candidate.match}% Match
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                    ★ {candidate.reputation}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{candidate.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {candidate.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-auto w-full text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                  onClick={() => alert('Convite enviado!')}
                >
                  Convidar <UserCheck className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
      </CardContent>
    </Card>
  )
}
