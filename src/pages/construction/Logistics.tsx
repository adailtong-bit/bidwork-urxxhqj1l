import { useState, useEffect } from 'react'
import { useLogisticsStore } from '@/stores/useLogisticsStore'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Truck,
  Navigation,
  Clock,
  CircleDollarSign,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function Logistics() {
  const { routes, addRoute } = useLogisticsStore()
  const { projects, addAllocatedCost } = useProjectStore()
  const { toast } = useToast()
  const { t, formatCurrency } = useLanguageStore()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState(false)

  // Smart Routing: Update destination when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId)
      if (project) {
        setDestination(
          `${project.address.street}, ${project.address.number} - ${project.address.city}`,
        )
      }
    }
  }, [selectedProjectId, projects])

  const handleOptimize = () => {
    if (!origin || !destination) {
      toast({
        variant: 'destructive',
        title: 'Dados incompletos',
        description: 'Informe origem e destino.',
      })
      return
    }

    setIsCalculating(true)
    // Simulate API calculation
    setTimeout(() => {
      const distanceVal = Math.floor(Math.random() * 50) + 5
      const timeVal = Math.floor(distanceVal * 2.5)
      const costVal = distanceVal * 8.5

      // Add Route
      addRoute({
        origin,
        destination,
        distance: `${distanceVal} km`,
        estimatedTime: `${timeVal} min`,
        status: 'planned',
        cost: costVal,
        vehicle: 'Sugestão: Caminhão Médio',
        projectId: selectedProjectId || undefined,
      })

      // Cost Linking: Allocating cost to project automatically
      if (selectedProjectId) {
        addAllocatedCost(selectedProjectId, {
          description: `Frete: ${origin} -> ${destination.substring(0, 20)}...`,
          amount: costVal,
          type: 'estimated',
          category: 'logistics',
          date: new Date(),
        })
      }

      setIsCalculating(false)
      setOrigin('')
      setDestination('')
      setSelectedProjectId('')
      toast({
        title: 'Rota Otimizada!',
        description: `Distância: ${distanceVal}km | Custo Alocado: ${formatCurrency(costVal)}`,
      })
    }, 1500)
  }

  const activeProjects = projects.filter((p) => p.status === 'in_progress')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Logística & Rotas</h1>
        <p className="text-muted-foreground">
          Otimize o transporte de materiais entre fornecedores e canteiros de
          obra.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Optimization Form */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" /> Nova Rota
            </CardTitle>
            <CardDescription>
              Insira os endereços para calcular a melhor rota.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Projeto (Destino Automático)</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (Avulso)</SelectItem>
                  {activeProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Origem (Fornecedor/Depósito)</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Endereço de partida"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Destino (Obra)</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Endereço de entrega"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  readOnly={!!selectedProjectId && selectedProjectId !== 'none'}
                  className={
                    selectedProjectId && selectedProjectId !== 'none'
                      ? 'bg-muted'
                      : ''
                  }
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleOptimize}
              disabled={isCalculating}
            >
              {isCalculating ? (
                'Calculando...'
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Calcular Rota Otimizada
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visualização de Mapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 border-2 border-dashed rounded-lg h-[300px] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 opacity-20 bg-[url('https://img.usecurling.com/p/800/400?q=map%20street')] bg-cover bg-center" />
              <div className="z-10 text-center space-y-2">
                <Navigation className="h-10 w-10 mx-auto text-primary" />
                <p className="font-medium text-muted-foreground">
                  Preview do Trajeto
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  O mapa interativo será renderizado aqui com os pontos de
                  parada e trânsito em tempo real.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes List */}
      <Card>
        <CardHeader>
          <CardTitle>Entregas e Rotas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem / Destino</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Estimativas</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Vinculado a</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => {
                const linkedProject = projects.find(
                  (p) => p.id === route.projectId,
                )
                return (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          {route.origin}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 pl-[3px]">
                          <div className="h-4 w-[1px] bg-border my-0.5" />
                        </span>
                        <span className="text-xs font-medium flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          {route.destination}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {route.vehicle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" /> {route.distance}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" /> {route.estimatedTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        <CircleDollarSign className="h-4 w-4 text-emerald-600" />
                        {formatCurrency(route.cost)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {linkedProject ? (
                        <Badge
                          variant="outline"
                          className="truncate max-w-[150px]"
                        >
                          {linkedProject.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          route.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : route.status === 'completed'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }
                      >
                        {route.status === 'in_transit'
                          ? 'Em Trânsito'
                          : route.status === 'completed'
                            ? 'Entregue'
                            : 'Planejado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {routes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma rota cadastrada.
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
