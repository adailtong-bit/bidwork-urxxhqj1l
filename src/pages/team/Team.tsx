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
  FileText,
  Stamp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function Team() {
  const { user, addTeamMember, removeTeamMember } = useAuthStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [emailToSearch, setEmailToSearch] = useState('')
  const [searchResult, setSearchResult] = useState<{
    name: string
    email: string
  } | null>(null)
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [role, setRole] = useState<TeamRole>('Collaborator')
  const [status, setStatus] = useState<'active' | 'busy' | 'inactive'>('active')

  if (!user) return null

  // PJ Corporate Logic
  const isPJ = user.entityType === 'pj'
  const members = isPJ ? user.teamMembers || [] : []

  // Mock search function
  const handleSearchUser = () => {
    if (!z.string().email().safeParse(emailToSearch).success) {
      setSearchError(t('val.email'))
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
        title: t('error'),
        description: 'Usuário já está na equipe.',
      })
      return
    }

    addTeamMember({
      name: searchResult.name,
      email: searchResult.email,
      role: role,
      status: status,
    })

    setIsDialogOpen(false)
    setEmailToSearch('')
    setSearchResult(null)
    setRole('Collaborator')
    setStatus('active')
    toast({
      title: t('team.added'),
      description: `${searchResult.name} agora faz parte da equipe corporativa.`,
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <ShieldCheck className="h-3 w-3" />
      case 'Accountant':
      case 'Financial':
        return <Calculator className="h-3 w-3" />
      case 'Project Manager':
      case 'Manager':
        return <LayoutDashboard className="h-3 w-3" />
      case 'Document Management':
        return <FileText className="h-3 w-3" />
      case 'License Manager':
        return <Stamp className="h-3 w-3" />
      default:
        return <Briefcase className="h-3 w-3" />
    }
  }

  const getTranslatedRole = (role: string) => {
    const roles: Record<string, string> = {
      Admin: 'Administrador',
      'Project Manager': 'Gerente de Projetos',
      Accountant: 'Contador',
      Collaborator: 'Colaborador',
      Financial: 'Financeiro',
      Manager: 'Gestor de Obras',
      'Document Management': 'Gestão de Documentos',
      'License Manager': 'Gestor de Licenças',
    }
    return roles[role] || role
  }

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div
            className="h-3 w-3 rounded-full bg-green-500 border border-white shadow-sm"
            title="Ativo"
          />
        )
      case 'busy':
        return (
          <div
            className="h-3 w-3 rounded-full bg-yellow-500 border border-white shadow-sm"
            title="Ocupado"
          />
        )
      case 'inactive':
        return (
          <div
            className="h-3 w-3 rounded-full bg-gray-400 border border-white shadow-sm"
            title="Inativo"
          />
        )
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPJ ? t('team.corporate') : t('team.my_team')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPJ ? t('team.desc_pj') : t('team.desc_pf')}
          </p>
        </div>
        {isPJ && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t('team.add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('team.add')}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('team.search_user')}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email..."
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('team.access_level')}</Label>
                      <Select
                        value={role}
                        onValueChange={(val: TeamRole) => setRole(val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Administrador</SelectItem>
                          <SelectItem value="Financial">Financeiro</SelectItem>
                          <SelectItem value="Manager">
                            Gestor de Obras
                          </SelectItem>
                          <SelectItem value="Document Management">
                            Gestão de Documentos
                          </SelectItem>
                          <SelectItem value="License Manager">
                            Gestor de Licenças
                          </SelectItem>
                          <SelectItem value="Collaborator">
                            Colaborador Comum
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status Inicial</Label>
                      <Select
                        value={status}
                        onValueChange={(val: any) => setStatus(val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="busy">Ocupado</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleAddMember} disabled={!searchResult}>
                  {t('add')}
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
            <h3 className="text-lg font-semibold">{t('team.function_pj')}</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              {t('team.function_pj_desc')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Always show current user card */}
        <Card className="flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <CardContent className="pt-6 flex flex-col items-center text-center flex-1">
            <div className="relative mb-4">
              <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  <UserIcon />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1">
                {getStatusIndicator('active')}
              </div>
            </div>
            <div className="space-y-1 mb-4">
              <h3 className="font-semibold text-lg">{user.name} (Você)</h3>
              <Badge variant="secondary">
                {getTranslatedRole(user.teamRole || 'Admin')}
              </Badge>
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
              className={`absolute top-0 left-0 w-full h-1 ${
                member.status === 'active'
                  ? 'bg-green-500'
                  : member.status === 'busy'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
              }`}
            />
            <CardContent className="pt-6 flex flex-col items-center text-center flex-1">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1">
                  {getStatusIndicator(member.status)}
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  <Badge
                    variant="secondary"
                    className="font-normal flex items-center gap-1"
                  >
                    {getRoleIcon(member.role)}
                    {getTranslatedRole(member.role)}
                  </Badge>
                </div>
              </div>

              <div className="w-full space-y-3 mt-auto">
                <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted/50 py-1.5 rounded-md gap-2">
                  <Mail className="h-3 w-3" /> {member.email}
                </div>

                {isPJ && (
                  <div className="pt-2 border-t w-full space-y-2">
                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs"
                      >
                        <Settings className="h-3 w-3 mr-1" />{' '}
                        {t('team.permissions')}
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
