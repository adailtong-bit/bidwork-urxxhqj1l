import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Mail, Plus, Trash2, Shield, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Team() {
  const { user, addTeamMember, removeTeamMember } = useAuthStore()
  const { toast } = useToast()
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Colaborador',
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!user) return null

  // PJ Corporate Logic
  const isPJ = user.entityType === 'pj'

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return
    addTeamMember(newMember)
    setIsDialogOpen(false)
    setNewMember({ name: '', email: '', role: 'Colaborador' })
    toast({
      title: 'Membro adicionado',
      description: 'Convite enviado por email.',
    })
  }

  // Static members for PF or fallback
  const staticMembers = [
    {
      id: 's1',
      name: 'Você',
      role: 'Administrador',
      email: user.email,
      avatar: user.avatar,
      status: 'active',
    },
  ]

  const members = isPJ ? user.teamMembers || staticMembers : staticMembers

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPJ ? 'Gestão Corporativa de Equipe' : 'Minha Equipe'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPJ
              ? 'Gerencie acessos, colaboradores e desempenho do time.'
              : 'Visualização dos membros da conta.'}
          </p>
        </div>
        {isPJ && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Membro da Equipe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Corporativo</Label>
                  <Input
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Função</Label>
                  <Input
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMember}>Enviar Convite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isPJ && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Funcionalidade PJ</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              A gestão avançada de múltiplos membros é exclusiva para contas
              Pessoa Jurídica (Corporate). Atualize sua conta para acessar.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member, i) => (
          <Card key={i} className="flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
            <CardContent className="pt-6 flex flex-col items-center text-center flex-1">
              <Avatar className="h-20 w-20 mb-4 border-2 border-background shadow-sm">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <Badge variant="secondary" className="font-normal">
                  {member.role}
                </Badge>
              </div>

              <div className="w-full space-y-3 mt-auto">
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 py-1.5 rounded-md gap-2">
                  <Mail className="h-3 w-3" /> {member.email}
                </div>

                {isPJ &&
                  member.id !== user.id && ( // Can't delete self
                    <div className="pt-2 border-t w-full flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        Performance: {member.performance?.toFixed(1) || 'N/A'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
