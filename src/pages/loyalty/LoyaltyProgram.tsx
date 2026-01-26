import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Trophy,
  Gift,
  TrendingUp,
  Star,
  ShieldCheck,
  Crown,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function LoyaltyProgram() {
  const { user } = useAuthStore()

  if (!user) return null

  // Level Calculation
  const points = user.loyaltyPoints || 0
  let level = 'Bronze'
  let nextLevel = 'Prata'
  let progress = (points / 2000) * 100
  let limit = 2000

  if (points >= 2000 && points < 5000) {
    level = 'Prata'
    nextLevel = 'Ouro'
    limit = 5000
    progress = ((points - 2000) / 3000) * 100
  } else if (points >= 5000) {
    level = 'Ouro'
    nextLevel = 'Platina'
    limit = 10000
    progress = ((points - 5000) / 5000) * 100
  }

  const benefits = {
    Bronze: ['Acúmulo de pontos padrão', 'Acesso a suporte básico'],
    Prata: [
      'Bônus de 10% em pontos',
      'Destaque leve no perfil',
      'Suporte prioritário',
    ],
    Ouro: [
      'Bônus de 20% em pontos',
      'Selo Gold no perfil',
      'Isenção de taxas de saque (1x/mês)',
    ],
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Programa de Fidelidade
        </h1>
        <p className="text-muted-foreground">
          Ganhe pontos por suas atividades e troque por benefícios exclusivos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-300" />
              Nível {level}
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Continue usando a plataforma para subir de nível.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-5xl font-bold">{points}</span>
                <span className="text-sm opacity-80 ml-2">pontos</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium opacity-80 mb-1">
                  Próximo nível: {nextLevel}
                </p>
                <p className="text-xs opacity-70">
                  Faltam {limit - points} pontos
                </p>
              </div>
            </div>
            <Progress
              value={progress}
              className="h-3 bg-primary-foreground/20"
            />
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" /> Benefícios Atuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {benefits[level as keyof typeof benefits]?.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={() => alert('Catálogo de prêmios em breve!')}
            >
              <Gift className="mr-2 h-4 w-4" /> Ver Prêmios
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(user.loyaltyHistory || []).length > 0 ? (
                user.loyaltyHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.date), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${item.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {item.type === 'earned' ? '+' : ''}
                      {item.points}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma transação registrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
