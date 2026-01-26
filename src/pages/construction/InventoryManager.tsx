import { useState } from 'react'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useProjectStore } from '@/stores/useProjectStore'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Package,
  Plus,
  ArrowDown,
  ArrowUp,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function InventoryManager() {
  const { items, addItem, updateQuantity } = useInventoryStore()
  const { projects } = useProjectStore()
  const { toast } = useToast()

  const [selectedProject, setSelectedProject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    materialName: '',
    quantity: '',
    unit: 'un',
    minStock: '',
    location: '',
  })

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesProject =
      selectedProject === 'all' || item.projectId === selectedProject
    const matchesSearch = item.materialName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesProject && matchesSearch
  })

  // Check alerts
  const lowStockItems = items.filter((item) => item.quantity <= item.minStock)

  const handleAddItem = () => {
    if (
      !newItem.materialName ||
      !newItem.quantity ||
      !newItem.minStock ||
      selectedProject === 'all'
    ) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos e selecione um projeto.',
      })
      return
    }

    addItem({
      projectId: selectedProject,
      materialName: newItem.materialName,
      quantity: Number(newItem.quantity),
      unit: newItem.unit,
      minStock: Number(newItem.minStock),
      location: newItem.location || 'Depósito Central',
    })

    setIsAddOpen(false)
    setNewItem({
      materialName: '',
      quantity: '',
      unit: 'un',
      minStock: '',
      location: '',
    })
    toast({ title: 'Item adicionado ao estoque' })
  }

  const handleUpdateStock = (id: string, current: number, delta: number) => {
    const newQty = Math.max(0, current + delta)
    updateQuantity(id, newQty)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h1>
        <p className="text-muted-foreground">
          Controle de materiais em canteiro e alertas de reposição.
        </p>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-l-destructive bg-destructive/10">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Alerta de Estoque Baixo
            </CardTitle>
            <CardDescription>
              {lowStockItems.length} materiais estão abaixo do nível mínimo.
              Providencie reposição.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-[300px]">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar material..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={selectedProject === 'all'}>
              <Plus className="mr-2 h-4 w-4" /> Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar ao Inventário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome do Material</Label>
                <Input
                  value={newItem.materialName}
                  onChange={(e) =>
                    setNewItem({ ...newItem, materialName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quantidade Inicial</Label>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Unidade</Label>
                  <Input
                    placeholder="kg, m³, un"
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Estoque Mínimo (Alerta)</Label>
                <Input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minStock: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Localização (Canteiro)</Label>
                <Input
                  value={newItem.location}
                  onChange={(e) =>
                    setNewItem({ ...newItem, location: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddItem}>Salvar Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Nível Atual</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minStock
                return (
                  <TableRow key={item.id} className={isLow ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {item.materialName}
                        {isLow && (
                          <Badge variant="destructive" className="text-[10px]">
                            BAIXO
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <div className="font-bold">
                        {item.quantity} {item.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.minStock} {item.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateStock(item.id, item.quantity, -1)
                          }
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateStock(item.id, item.quantity, 1)
                          }
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum item encontrado. Selecione um projeto ou adicione
                    itens.
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
