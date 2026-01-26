import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/stores/useAuthStore'
import { Building2, User, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function TestProfileSwitcher() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleTestLogin = async (email: string) => {
    await login(email, 'test1234')
    navigate('/dashboard')
  }

  const profiles = [
    {
      role: 'Executor PF',
      email: 'executor.pf@bidwork.app',
      label: 'Freelancer',
      icon: User,
      color: 'text-blue-500',
    },
    {
      role: 'Executor PJ',
      email: 'executor.pj@bidwork.app',
      label: 'Agência',
      icon: Building2,
      color: 'text-indigo-500',
    },
    {
      role: 'Contratante PF',
      email: 'contractor.pf@bidwork.app',
      label: 'Individual',
      icon: User,
      color: 'text-green-500',
    },
    {
      role: 'Contratante PJ',
      email: 'contractor.pj@bidwork.app',
      label: 'Corporativo',
      icon: Building2,
      color: 'text-orange-500',
    },
  ]

  return (
    <Card className="border-dashed border-2 bg-muted/30 mt-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Acesso Rápido (Ambiente de Teste)
        </CardTitle>
        <CardDescription className="text-xs">
          Selecione um perfil para pular o login e testar funcionalidades.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {profiles.map((p) => (
          <Button
            key={p.email}
            variant="outline"
            size="sm"
            className="h-auto py-2 flex flex-col items-start gap-1 text-left"
            onClick={() => handleTestLogin(p.email)}
          >
            <div className="flex items-center gap-2 w-full">
              <p.icon className={`h-3 w-3 ${p.color}`} />
              <span className="font-semibold text-xs">{p.role}</span>
            </div>
            <span className="text-[10px] text-muted-foreground w-full truncate">
              {p.label}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
