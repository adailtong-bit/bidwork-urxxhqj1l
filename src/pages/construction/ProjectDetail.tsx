import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore, Stage } from '@/stores/useProjectStore'
import { useJobStore } from '@/stores/useJobStore'
import { useMaterialStore } from '@/stores/useMaterialStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Plus,
  HardHat,
  Package,
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Upload,
  FileSpreadsheet,
  FileBox,
  Eye,
  Download,
  Building2,
  FileText,
  Clock,
  Edit2,
  LayoutList,
  LayoutGrid,
} from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    getProject,
    importExternalBudget,
    importTimeline,
    addBimFile,
    addPartner,
    updateStage,
  } = useProjectStore()
  const { getJobsByProject } = useJobStore()
  const { getOrdersByProject } = useMaterialStore()
  const { toast } = useToast()

  const csvInputRef = useRef<HTMLInputElement>(null)

  const project = getProject(id!)
  const jobs = id ? getJobsByProject(id) : []
  const orders = id ? getOrdersByProject(id) : []

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importType, setImportType] = useState<'budget' | 'timeline'>('budget')
  const [isBimUploadOpen, setIsBimUploadOpen] = useState(false)
  const [isPartnerOpen, setIsPartnerOpen] = useState(false)
  const [selectedStageForBim, setSelectedStageForBim] = useState<string | null>(
    null,
  )

  // View Toggle State
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Partner Form State
  const [newPartner, setNewPartner] = useState({
    companyName: '',
    stageId: '',
    agreedPrice: '',
  })

  // Date Edit State
  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [stageDates, setStageDates] = useState<{
    start: Date
    end: Date
  } | null>(null)

  if (!project) return <div>Projeto não encontrado</div>

  const parseCSV = (text: string) => {
    const lines = text.split('\n')
    // Remove header
    if (lines.length > 0) lines.shift()

    return lines
      .map((line) => {
        const parts = line.split(/;|,\s?/) // Split by ; or ,
        if (parts.length < 3) return null

        // Check if it's new format: Level, Name, Start, End, Progress
        const isNewFormat = parts.length >= 5 && !isNaN(parseInt(parts[0]))

        if (isNewFormat) {
          const level = parseInt(parts[0])
          const name = parts[1].trim()
          const startStr = parts[2].trim()
          const endStr = parts[3].trim()
          const progress = parseInt(parts[4]) || 0

          const startDate = parse(startStr, 'dd/MM/yyyy', new Date())
          const endDate = parse(endStr, 'dd/MM/yyyy', new Date())

          if (!isValid(startDate) || !isValid(endDate)) return null

          return {
            level,
            name,
            startDate,
            endDate,
            progress,
          }
        } else {
          // Old format fallback: Name, Start, End (Assume Level 1, Progress 0)
          const name = parts[0].trim()
          const startStr = parts[1].trim()
          const endStr = parts[2].trim()

          const startDate = parse(startStr, 'dd/MM/yyyy', new Date())
          const endDate = parse(endStr, 'dd/MM/yyyy', new Date())

          if (!isValid(startDate) || !isValid(endDate)) return null

          return {
            level: 1,
            name,
            startDate,
            endDate,
            progress: 0,
          }
        }
      })
      .filter(
        (
          item,
        ): item is {
          level: number
          name: string
          startDate: Date
          endDate: Date
          progress: number
        } => item !== null,
      )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (importType === 'timeline') {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result
        if (typeof text === 'string') {
          try {
            const timelineData = parseCSV(text)
            if (timelineData.length === 0) {
              toast({
                variant: 'destructive',
                title: 'Erro na leitura',
                description: 'Nenhuma data válida encontrada no arquivo.',
              })
              return
            }
            importTimeline(project.id, timelineData)
            toast({
              title: 'Cronograma Importado',
              description: `${timelineData.length} itens atualizados com sucesso via CSV.`,
            })
            setIsImportOpen(false)
          } catch (err) {
            toast({
              variant: 'destructive',
              title: 'Erro ao importar',
              description: 'Formato de arquivo inválido.',
            })
          }
        }
      }
      reader.readAsText(file)
    } else {
      // Mock Budget Import for now as per requirements focus on timeline
      importExternalBudget(project.id, [
        { stageName: 'Fundação', material: 85000, labor: 42000 },
        { stageName: 'Alvenaria', material: 160000, labor: 95000 },
        { stageName: 'Instalações', material: 65000, labor: 52000 },
      ])
      toast({
        title: 'Orçamento Importado',
        description: 'Os valores estimados foram atualizados (Mock Data).',
      })
      setIsImportOpen(false)
    }
  }

  const handleImportClick = () => {
    csvInputRef.current?.click()
  }

  const handleAddPartner = () => {
    if (
      !newPartner.companyName ||
      !newPartner.stageId ||
      !newPartner.agreedPrice
    ) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha todos os dados da empresa parceira.',
      })
      return
    }

    addPartner(project.id, {
      companyName: newPartner.companyName,
      stageId: newPartner.stageId,
      agreedPrice: Number(newPartner.agreedPrice),
      employees: [],
      // Mock file URLs
      contractUrl: '#',
      licensesUrl: '#',
      insuranceUrl: '#',
    })
    setIsPartnerOpen(false)
    setNewPartner({ companyName: '', stageId: '', agreedPrice: '' })
    toast({ title: 'Parceiro Registrado com Sucesso!' })
  }

  const handleStageDateUpdate = (stageId: string) => {
    if (stageDates) {
      updateStage(project.id, stageId, {
        startDate: stageDates.start,
        endDate: stageDates.end,
      })
      setEditingStage(null)
      toast({ title: 'Datas atualizadas' })
    }
  }

  const handleBimUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedStageForBim) {
      addBimFile(project.id, selectedStageForBim, {
        id: Math.random().toString(36),
        name: file.name,
        type: 'IFC/BIM',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: '#',
        uploadedAt: new Date(),
      })
      toast({
        title: 'Arquivo BIM Adicionado',
        description: 'Metadados vinculados à etapa com sucesso.',
      })
      setIsBimUploadOpen(false)
    }
  }

  const getStageFinancials = (stage: Stage) => {
    const stageJobs = jobs.filter((j) => j.stageId === stage.id)
    const stageOrders = orders.filter((o) => o.stageId === stage.id)

    return {
      jobs: stageJobs,
      orders: stageOrders,
      totalBudget: stage.budgetMaterial + stage.budgetLabor,
      totalActual: stage.actualMaterial + stage.actualLabor,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/construction/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {project.name}
            <Badge
              variant={
                project.status === 'in_progress' ? 'default' : 'secondary'
              }
            >
              {project.status === 'in_progress'
                ? 'Em Andamento'
                : project.status}
            </Badge>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {project.address
                ? `${project.address.street}, ${project.address.number} - ${project.address.neighborhood}, ${project.address.city} - ${project.address.state}`
                : project.location}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />{' '}
              {format(project.startDate, 'dd/MM/yyyy')} -{' '}
              {format(project.endDate, 'dd/MM/yyyy')}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="stages" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="stages">Etapas (Workflow)</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="team">Equipe & Parceiros</TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid className="mr-2 h-3 w-3" /> Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setViewMode('table')}
              >
                <LayoutList className="mr-2 h-3 w-3" /> Tabela (WBS)
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsImportOpen(true)
                setImportType('timeline')
              }}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar Cronograma
              (CSV)
            </Button>
          </div>

          {viewMode === 'table' ? (
            <ProjectScheduleTable
              projectId={project.id}
              stages={project.stages}
            />
          ) : (
            <div className="space-y-6">
              {project.stages.map((stage) => {
                const { totalBudget, totalActual } = getStageFinancials(stage)
                const percent = stage.progress // Use explicit progress now, fallback to financial if needed

                return (
                  <Card
                    key={stage.id}
                    className={cn(
                      'overflow-hidden border-l-4',
                      stage.status === 'delayed'
                        ? 'border-l-red-500'
                        : 'border-l-primary',
                    )}
                  >
                    <CardHeader className="bg-muted/20 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {stage.name}
                            {stage.status === 'completed' && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {stage.status === 'delayed' && (
                              <Badge variant="destructive" className="ml-2">
                                Atrasado
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{stage.description}</CardDescription>

                          {/* Workflow Date Management */}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {editingStage === stage.id ? (
                              <div className="flex items-center gap-2 bg-background p-2 rounded border shadow-sm">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8"
                                    >
                                      {stageDates
                                        ? format(stageDates.start, 'dd/MM')
                                        : 'Início'}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-0">
                                    <Calendar
                                      mode="single"
                                      selected={stageDates?.start}
                                      onSelect={(d) =>
                                        d &&
                                        setStageDates((prev) => ({
                                          ...prev!,
                                          start: d,
                                        }))
                                      }
                                    />
                                  </PopoverContent>
                                </Popover>
                                <span>até</span>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8"
                                    >
                                      {stageDates
                                        ? format(stageDates.end, 'dd/MM')
                                        : 'Fim'}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-0">
                                    <Calendar
                                      mode="single"
                                      selected={stageDates?.end}
                                      onSelect={(d) =>
                                        d &&
                                        setStageDates((prev) => ({
                                          ...prev!,
                                          end: d,
                                        }))
                                      }
                                    />
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    handleStageDateUpdate(stage.id)
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div
                                className="flex items-center gap-2 group cursor-pointer"
                                onClick={() => {
                                  setEditingStage(stage.id)
                                  setStageDates({
                                    start: stage.startDate,
                                    end: stage.endDate,
                                  })
                                }}
                              >
                                <Clock className="h-4 w-4" />
                                {format(stage.startDate, 'dd/MM/yyyy')} -{' '}
                                {format(stage.endDate, 'dd/MM/yyyy')}
                                <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Execução: {stage.progress}%
                          </div>
                          <div
                            className={`text-sm ${totalActual > totalBudget ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}
                          >
                            Gasto: R$ {totalActual.toLocaleString('pt-BR')} /{' '}
                            {totalBudget.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={percent}
                        className={cn(
                          'h-2 mt-4',
                          stage.status === 'delayed' && 'bg-red-100',
                        )}
                      />
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                      {/* Labor Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            <HardHat className="h-4 w-4 text-orange-500" /> Mão
                            de Obra
                          </h3>
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to={`/post-job?projectId=${project.id}&stageId=${stage.id}`}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Contratar
                            </Link>
                          </Button>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Orçado
                            </span>
                            <span>
                              R$ {stage.budgetLabor.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Realizado
                            </span>
                            <span className="font-medium">
                              R$ {stage.actualLabor.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Materials Section */}
                      <div className="space-y-4 border-l pl-0 md:pl-6 border-dashed md:border-solid">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />{' '}
                            Materiais
                          </h3>
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to={`/construction/materials?projectId=${project.id}&stageId=${stage.id}`}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Comprar
                            </Link>
                          </Button>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Orçado
                            </span>
                            <span>
                              R$ {stage.budgetMaterial.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Realizado
                            </span>
                            <span className="font-medium">
                              R$ {stage.actualMaterial.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BIM Integration Section */}
                      <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2 text-indigo-700">
                            <FileBox className="h-4 w-4" /> Integração BIM
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800"
                            onClick={() => {
                              setSelectedStageForBim(stage.id)
                              setIsBimUploadOpen(true)
                            }}
                          >
                            <Upload className="h-3 w-3 mr-1" /> Vincular Arquivo
                          </Button>
                        </div>
                        {stage.bimFiles && stage.bimFiles.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stage.bimFiles.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 rounded-md border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 transition-colors group"
                              >
                                <div className="h-10 w-10 bg-indigo-100 rounded flex items-center justify-center shrink-0">
                                  <FileBox className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {file.size} • {file.type}
                                  </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                            Nenhum modelo BIM vinculado a esta etapa.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>
                  Consolidado de todas as etapas.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportOpen(true)
                  setImportType('budget')
                }}
              >
                <Upload className="mr-2 h-4 w-4" /> Importar Orçamento (CSV)
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Orçamento (Mat + MDO)</TableHead>
                    <TableHead>Realizado</TableHead>
                    <TableHead>Desvio</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.stages.map((stage) => {
                    const budget = stage.budgetMaterial + stage.budgetLabor
                    const actual = stage.actualMaterial + stage.actualLabor
                    const diff = actual - budget
                    return (
                      <TableRow key={stage.id}>
                        <TableCell className="font-medium">
                          {stage.name}
                        </TableCell>
                        <TableCell>
                          R$ {budget.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          R$ {actual.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell
                          className={
                            diff > 0 ? 'text-red-500' : 'text-green-500'
                          }
                        >
                          {diff > 0 ? '+' : ''} R${' '}
                          {diff.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{stage.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Parceiros e Empresas</CardTitle>
                <CardDescription>
                  Gestão de contratados externos e contratos.
                </CardDescription>
              </div>
              <Dialog open={isPartnerOpen} onOpenChange={setIsPartnerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Registrar Parceiro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Contrato de Parceria</DialogTitle>
                    <DialogDescription>
                      Associe uma empresa a uma etapa do projeto.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Nome da Empresa/Parceiro</Label>
                      <Input
                        value={newPartner.companyName}
                        onChange={(e) =>
                          setNewPartner({
                            ...newPartner,
                            companyName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Etapa Responsável</Label>
                      <Select
                        onValueChange={(val) =>
                          setNewPartner({ ...newPartner, stageId: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {project.stages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Preço Combinado (R$)</Label>
                      <Input
                        type="number"
                        value={newPartner.agreedPrice}
                        onChange={(e) =>
                          setNewPartner({
                            ...newPartner,
                            agreedPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="border border-dashed p-4 rounded text-center text-sm text-muted-foreground">
                      <p className="mb-2">Documentos Obrigatórios</p>
                      <div className="flex justify-center gap-2">
                        <Badge variant="outline">
                          <FileText className="w-3 h-3 mr-1" /> Contrato
                        </Badge>
                        <Badge variant="outline">
                          <FileText className="w-3 h-3 mr-1" /> Licenças
                        </Badge>
                        <Badge variant="outline">
                          <FileText className="w-3 h-3 mr-1" /> Seguro
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        disabled
                      >
                        Upload (Mock)
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddPartner}>Salvar Registro</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {project.partners && project.partners.length > 0 ? (
                <div className="grid gap-4">
                  {project.partners.map((partner) => (
                    <div
                      key={partner.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{partner.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            Etapa:{' '}
                            {
                              project.stages.find(
                                (s) => s.id === partner.stageId,
                              )?.name
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          R$ {partner.agreedPrice.toLocaleString('pt-BR')}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] cursor-pointer hover:bg-muted"
                          >
                            Contrato
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] cursor-pointer hover:bg-muted"
                          >
                            Seguro
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum parceiro registrado.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog (Shared for Budget and Timeline) */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importType === 'budget'
                ? 'Importar Orçamento'
                : 'Importar Cronograma (WBS)'}
            </DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo CSV ou Excel.
              {importType === 'timeline' && (
                <div className="mt-2 text-xs bg-muted p-2 rounded">
                  <p className="font-semibold">Formatos Suportados:</p>
                  <p>1. Simples: Nome; Início (dd/mm/aaaa); Fim (dd/mm/aaaa)</p>
                  <p>
                    2. Hierárquico: Nível (1 ou 2); Nome; Início; Fim; Progresso
                    (%)
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleImportClick}
            >
              <input
                type="file"
                accept=".csv"
                ref={csvInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="font-medium">Clique para selecionar o arquivo</p>
              <p className="text-xs text-muted-foreground">.CSV (Max 5MB)</p>
            </div>
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-xs flex gap-2">
              <Upload className="h-4 w-4 shrink-0" />
              {importType === 'budget'
                ? 'Substituirá estimativas financeiras.'
                : 'Atualizará datas e progresso das etapas correspondentes.'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* BIM Upload Dialog */}
      <Dialog open={isBimUploadOpen} onOpenChange={setIsBimUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Arquivo BIM</DialogTitle>
            <DialogDescription>
              Vincule arquivos técnicos (IFC, RVT, DWG) à etapa selecionada.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleBimUpload}
              />
              <FileBox className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="font-medium">
                Arraste ou clique para selecionar arquivo
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos suportados: .IFC, .RVT, .DWG, .DXF (Max 500MB)
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
