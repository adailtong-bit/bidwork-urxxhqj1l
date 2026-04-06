import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit2, KeyRound, Search, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { user } = useAuth()

  const [editUser, setEditUser] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar usuários',
        description: error.message,
      })
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSave = async () => {
    if (!editUser) return
    setIsSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        name: editUser.name,
        role: editUser.role,
        is_admin: editUser.is_admin,
        status: editUser.status,
        entity_type: editUser.entity_type,
        company_name: editUser.company_name,
      } as any)
      .eq('id', editUser.id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message,
      })
    } else {
      toast({ title: 'Usuário atualizado com sucesso' })
      fetchUsers()
      setEditUser(null)
    }
    setIsSaving(false)
  }

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } else {
      toast({
        title: 'Link enviado',
        description: `Um e-mail de redefinição foi enviado para ${email}.`,
      })
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie perfis, permissões e acessos.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>
            Visualize e edite as informações de todos os usuários da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel / Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || 'Sem Nome'}
                        {user.is_admin && (
                          <Badge variant="destructive" className="ml-2">
                            Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">
                        {user.role || 'contractor'}{' '}
                        <span className="text-muted-foreground text-xs uppercase ml-1">
                          ({user.entity_type || 'pf'})
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === 'inactive' ? 'secondary' : 'default'
                          }
                          className={
                            user.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600'
                              : ''
                          }
                        >
                          {user.status === 'inactive' ? 'Inativo' : 'Ativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user.email)}
                            title="Resetar Senha"
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditUser({ ...user })}
                            title="Editar Usuário"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">E-mail</Label>
                <Input
                  value={editUser.email}
                  disabled
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nome</Label>
                <Input
                  value={editUser.name || ''}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tipo Entidade</Label>
                <div className="col-span-3">
                  <Select
                    value={editUser.entity_type || 'pf'}
                    onValueChange={(val) =>
                      setEditUser({ ...editUser, entity_type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pf">Pessoa Física (PF)</SelectItem>
                      <SelectItem value="pj">Pessoa Jurídica (PJ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editUser.entity_type === 'pj' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Empresa</Label>
                  <Input
                    value={editUser.company_name || ''}
                    onChange={(e) =>
                      setEditUser({ ...editUser, company_name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Papel / Função</Label>
                <div className="col-span-3">
                  <Select
                    value={editUser.role || 'contractor'}
                    onValueChange={(val) =>
                      setEditUser({ ...editUser, role: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contractor">Contratante</SelectItem>
                      <SelectItem value="executor">Executor</SelectItem>
                      <SelectItem value="partner">Parceiro</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select
                    value={editUser.status || 'active'}
                    onValueChange={(val) =>
                      setEditUser({ ...editUser, status: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Acesso Root</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant={editUser.is_admin ? 'default' : 'outline'}
                    onClick={() =>
                      setEditUser({ ...editUser, is_admin: !editUser.is_admin })
                    }
                    className={
                      editUser.is_admin
                        ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                        : ''
                    }
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    {editUser.is_admin ? 'Admin Habilitado' : 'Tornar Admin'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
