import { useState } from 'react'
import { useAuthStore, TeamRole } from '@/stores/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Plus,
  Trash2,
  Shield,
  User as UserIcon,
  Briefcase,
  Activity,
  Settings,
  ShieldCheck,
  Calculator,
  LayoutDashboard,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'

export default function Team() {
  const { user, addTeamMember, removeTeamMember } = useAuthStore()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [emailToSearch, setEmailToSearch] = useState('')
  const [searchResult, setSearchResult] = useState<{
    name: string
    email: string
  } | null>(null)
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [role, setRole] = useState<TeamRole>('Collaborator')

  if (!user) return null

  // PJ Corporate Logic
  const isPJ = user.entityType === 'pj'
  const members = isPJ ? user.teamMembers || [] : []

  // Mock search function
  const handleSearchUser = () => {
    if (!z.string().email().safeParse(emailToSearch).success) {
      setSearchError('Email inválido')
      setSearchResult(null)
      return
    }

    setIsSearching(true)
    setSearchError('')
    setSearchResult(null)

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
      // Mock: only allow emails that contain "bidwork" or "test" or "gmail" to be "found"
      if (
        emailToSearch.includes('bidwork') ||
        emailToSearch.includes('test') ||
        emailToSearch.includes('gmail')
      ) {
        setSearchResult({
          name: emailToSearch.split('@')[0].toUpperCase(), // Mock name
          email: emailToSearch,
        })
      } else {
        setSearchError('Usuário não encontrado na plataforma.')
      }
    }, 1000)
  }

  const handleAddMember = () => {
    if (!searchResult) return

    // Check if already in team
    if (members.some((m) => m.email === searchResult.email)) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Usuário já está na equipe.',
      })
      return
    }

    addTeamMember({
      name: searchResult.name,
      email: searchResult.email,
      role: role,
    })

    setIsDialogOpen(false)
    setEmailToSearch('')
    setSearchResult(null)
    setRole('Collaborator')
    toast({
      title: 'Membro adicionado',
      description: `${searchResult.name} agora faz parte da equipe corporativa.`,
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <ShieldCheck className="h-3 w-3" />
      case 'Accountant':
        return <Calculator className="h-3 w-3" />
      case 'Project Manager':
        return <LayoutDashboard className="h-3 w-3" />
      default:
        return <Briefcase className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPJ ? 'Gestão Corporativa de Equipe' : 'Minha Equipe'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPJ
              ? 'Gerencie acessos, colaboradores e permissões do time.'
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
                  <Label>Buscar Usuário Registrado</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email do usuário..."
                      value={emailToSearch}
                      onChange={(e) => setEmailToSearch(e.target.value)}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleSearchUser}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Activity className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {searchError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> {searchError}
                    </p>
                  )}
                </div>

                {searchResult && (
                  <div className="bg-muted p-3 rounded-md flex items-center gap-3 border border-green-200">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {searchResult.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchResult.email}
                      </p>
                    </div>
                  </div>
                )}

                {searchResult && (
                  <div className="space-y-2">
                    <Label>Nível de Acesso (RBAC)</Label>
                    <Select
                      value={role}
                      onValueChange={(val: TeamRole) => setRole(val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">
                          Admin (Acesso Total)
                        </SelectItem>
                        <SelectItem value="Project Manager">
                          Gerente de Projetos
                        </SelectItem>
                        <SelectItem value="Accountant">Contador</SelectItem>
                        <SelectItem value="Collaborator">
                          Colaborador
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleAddMember} disabled={!searchResult}>
                  Adicionar ao Time
                </Button>
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
              Pessoa Jurídica.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Always show current user card */}
        <Card className="flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <CardContent className="pt-6 flex flex-col items-center text-center flex-1">
            <Avatar className="h-20 w-20 mb-4 border-2 border-background shadow-sm">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 mb-4">
              <h3 className="font-semibold text-lg">{user.name} (Você)</h3>
              <Badge variant="secondary">{user.teamRole || 'Admin'}</Badge>
            </div>
            <div className="w-full space-y-3 mt-auto">
              <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 py-1.5 rounded-md gap-2">
                <Mail className="h-3 w-3" /> {user.email}
              </div>
            </div>
          </CardContent>
        </Card>

        {members.map((member, i) => (
          <Card
            key={i}
            className="flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors"
          >
            <div
              className={`absolute top-0 left-0 w-full h-1 ${member.status === 'busy' ? 'bg-yellow-500' : 'bg-green-500'}`}
            />
            <CardContent className="pt-6 flex flex-col items-center text-center flex-1">
              <Avatar className="h-20 w-20 mb-4 border-2 border-background shadow-sm">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <Badge
                    variant="secondary"
                    className="font-normal flex items-center gap-1"
                  >
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                </div>
              </div>

              <div className="w-full space-y-3 mt-auto">
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 py-1.5 rounded-md gap-2">
                  <Mail className="h-3 w-3" /> {member.email}
                </div>

                {isPJ && (
                  <div className="pt-2 border-t w-full space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Performance
                      </span>
                      <span className="font-bold text-primary">
                        {member.performance?.toFixed(1) || '0.0'}
                      </span>
                    </div>

                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs"
                      >
                        <Settings className="h-3 w-3 mr-1" /> Permissões
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
