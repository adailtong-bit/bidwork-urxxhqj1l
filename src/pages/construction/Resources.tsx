import { useState } from 'react'
import { useContractorStore } from '@/stores/useContractorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Search, Building2, UserCog } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Resources() {
  const { contractors, addContractor, updateContractor } = useContractorStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    linkedPjId: 'none',
  })

  const filteredContractors = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    if (!formData.name || !formData.role) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Nome e Função são obrigatórios.',
      })
      return
    }

    addContractor({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      linkedPjId:
        formData.linkedPjId === 'none' ? undefined : formData.linkedPjId,
      skills: [],
    })

    setIsAddOpen(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      linkedPjId: 'none',
    })
    toast({ title: 'Profissional registrado com sucesso' })
  }

  // Mock partners for dropdown
  const mockPartners = [
    { id: 'partner-1', name: 'Parceiro Construções Ltda' },
    { id: 'partner-2', name: 'Elétrica Express' },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Banco de Talentos
          </h1>
          <p className="text-muted-foreground">
            Gestão de profissionais e contratados individuais.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Profissional</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Função / Especialidade</Label>
                <Input
                  placeholder="Ex: Pedreiro, Encanador"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Vincular a Empresa (Opcional)</Label>
                <Select
                  value={formData.linkedPjId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, linkedPjId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (Autônomo)</SelectItem>
                    {mockPartners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar Registro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Profissionais Cadastrados
            </CardTitle>
            <div className="relative w-[250px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContractors.map((contractor) => (
                <TableRow key={contractor.id}>
                  <TableCell className="font-medium">
                    {contractor.name}
                  </TableCell>
                  <TableCell>{contractor.role}</TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      <div>{contractor.email}</div>
                      <div>{contractor.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contractor.linkedPjId ? (
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {mockPartners.find(
                          (p) => p.id === contractor.linkedPjId,
                        )?.name || 'Empresa'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <UserCog className="h-3 w-3" /> Autônomo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        contractor.status === 'available'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }
                    >
                      {contractor.status === 'available'
                        ? 'Disponível'
                        : 'Ocupado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContractors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum profissional encontrado.
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
