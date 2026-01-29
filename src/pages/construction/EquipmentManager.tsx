import { useState } from 'react'
import { useEquipmentStore } from '@/stores/useEquipmentStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Truck,
  Wrench,
  AlertTriangle,
  Search,
  Plus,
  Calendar as CalendarIcon,
  MapPin,
} from 'lucide-react'
import { format, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function EquipmentManager() {
  const {
    equipment,
    addEquipment,
    assignToProject,
    returnEquipment,
    scheduleMaintenance,
  } = useEquipmentStore()
  const { projects } = useProjectStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedEq, setSelectedEq] = useState<string | null>(null)

  const [newItem, setNewItem] = useState({
    name: '',
    type: 'Pesado',
    serialNumber: '',
    purchaseDate: new Date(),
    location: 'Pátio Central',
  })
  const [assignData, setAssignData] = useState({ projectId: '' })

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const maintenanceAlerts = equipment.filter((eq) =>
    isBefore(eq.nextMaintenance, addDays(new Date(), 7)),
  )

  const handleAdd = () => {
    addEquipment({
      name: newItem.name,
      type: newItem.type,
      serialNumber: newItem.serialNumber,
      status: 'available',
      purchaseDate: newItem.purchaseDate,
      nextMaintenance: addDays(new Date(), 90),
      location: newItem.location,
    })
    setIsAddOpen(false)
    toast({ title: 'Equipamento cadastrado' })
  }

  const handleAssign = () => {
    if (!selectedEq || !assignData.projectId) return
    const project = projects.find((p) => p.id === assignData.projectId)
    if (project) {
      assignToProject(selectedEq, project.id, project.name, project.location)
      toast({
        title: 'Equipamento alocado',
        description: `Enviado para ${project.name} (${project.location})`,
      })
      setIsAssignOpen(false)
    }
  }

  const getTypeLabel = (type: string) => {
    // Map internal type to translation key
    const key = `eq.${type.toLowerCase()}`
    // Fallback to type if no translation found (e.g. if type is custom)
    // But since type is a select, we can control it.
    // For now, assuming type matches keys: Pesado -> heavy, Leve -> light
    // Actually the state has capitalized names 'Pesado'.
    // Let's map manually
    const mapping: Record<string, string> = {
      Pesado: 'heavy',
      Leve: 'light',
      Veículo: 'vehicle',
      Estrutura: 'structure',
    }
    return t(`eq.${mapping[type] || 'other'}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Frota e Equipamentos
          </h1>
          <p className="text-muted-foreground">
            Controle de inventário, alocação e manutenção.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Equipamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome/Modelo</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Número de Série</Label>
                <Input
                  value={newItem.serialNumber}
                  onChange={(e) =>
                    setNewItem({ ...newItem, serialNumber: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Localização Inicial</Label>
                <Input
                  value={newItem.location}
                  onChange={(e) =>
                    setNewItem({ ...newItem, location: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select
                  value={newItem.type}
                  onValueChange={(val) => setNewItem({ ...newItem, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pesado">{t('eq.heavy')}</SelectItem>
                    <SelectItem value="Leve">{t('eq.light')}</SelectItem>
                    <SelectItem value="Veículo">{t('eq.vehicle')}</SelectItem>
                    <SelectItem value="Estrutura">
                      {t('eq.structure')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {maintenanceAlerts.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" /> Manutenção Necessária
            </CardTitle>
            <CardDescription>
              {maintenanceAlerts.length} equipamentos precisam de atenção em
              breve.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou série..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="available">{t('status.available')}</SelectItem>
            <SelectItem value="in_use">{t('status.in_use')}</SelectItem>
            <SelectItem value="maintenance">
              {t('status.maintenance')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => (
          <Card key={eq.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline">{getTypeLabel(eq.type)}</Badge>
                <Badge
                  className={
                    eq.status === 'available'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : eq.status === 'in_use'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                  }
                >
                  {t(`status.${eq.status}`)}
                </Badge>
              </div>
              <CardTitle className="mt-2 flex items-center gap-2">
                <Truck className="h-5 w-5" /> {eq.name}
              </CardTitle>
              <CardDescription>Série: {eq.serialNumber}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span
                  className={
                    eq.status === 'in_use'
                      ? 'font-semibold text-blue-700'
                      : 'text-muted-foreground'
                  }
                >
                  {eq.location}
                </span>
              </div>
              {eq.status === 'in_use' && (
                <div className="text-xs bg-blue-50 p-2 rounded text-blue-800">
                  Projeto: <strong>{eq.projectName}</strong>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
                <CalendarIcon className="h-4 w-4" />
                Próx. Manutenção: {format(eq.nextMaintenance, 'dd/MM/yyyy')}
                {isBefore(eq.nextMaintenance, new Date()) && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              {eq.status === 'available' ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setSelectedEq(eq.id)
                    setIsAssignOpen(true)
                  }}
                >
                  Alocar
                </Button>
              ) : eq.status === 'in_use' ? (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => {
                    returnEquipment(eq.id)
                    toast({ title: 'Equipamento devolvido ao pátio' })
                  }}
                >
                  Devolver
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => {
                    scheduleMaintenance(eq.id, addDays(new Date(), 90))
                    returnEquipment(eq.id) // Sets to available
                    toast({ title: 'Manutenção concluída' })
                  }}
                >
                  <Wrench className="mr-2 h-4 w-4" /> Concluir Manutenção
                </Button>
              )}
              {eq.status !== 'maintenance' && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    // Set status to maintenance manually
                    useEquipmentStore.setState((state) => ({
                      equipment: state.equipment.map((e) =>
                        e.id === eq.id
                          ? { ...e, status: 'maintenance', location: 'Oficina' }
                          : e,
                      ),
                    }))
                    toast({ title: 'Enviado para manutenção' })
                  }}
                  title="Enviar para Manutenção"
                >
                  <Wrench className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alocar Equipamento</DialogTitle>
            <DialogDescription>
              Selecione o projeto de destino para atualizar a localização.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Projeto</Label>
            <Select onValueChange={(val) => setAssignData({ projectId: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {projects
                  .filter((p) => p.status === 'in_progress')
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign}>Confirmar Alocação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
