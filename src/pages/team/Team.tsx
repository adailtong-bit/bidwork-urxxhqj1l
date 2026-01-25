import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Plus } from 'lucide-react'

const members = [
  {
    name: 'Ana Souza',
    role: 'Gerente de Produto',
    email: 'ana@bidwork.app',
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=10',
  },
  {
    name: 'Carlos Lima',
    role: 'Engenheiro de Software',
    email: 'carlos@bidwork.app',
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=11',
  },
  {
    name: 'Mariana Costa',
    role: 'Designer',
    email: 'mariana@bidwork.app',
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=12',
  },
  {
    name: 'Pedro Santos',
    role: 'Marketing',
    email: 'pedro@bidwork.app',
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=13',
  },
]

export default function Team() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os membros da sua organização.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Convidar Membro
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member, i) => (
          <Card key={i} className="flex flex-col items-center text-center pt-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={member.img} />
              <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <CardContent className="space-y-2">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
              <div className="pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="mr-2 h-3 w-3" /> {member.email}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
