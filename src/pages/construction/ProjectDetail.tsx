import { useState } from 'react'
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
  UserCheck,
  Upload,
  FileSpreadsheet,
  FileBox,
  Eye,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
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

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject, importExternalBudget, addBimFile } = useProjectStore()
  const { getJobsByProject } = useJobStore()
  const { getOrdersByProject } = useMaterialStore()
  const { toast } = useToast()

  const project = getProject(id!)
  const jobs = id ? getJobsByProject(id) : []
  const orders = id ? getOrdersByProject(id) : []

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isBimUploadOpen, setIsBimUploadOpen] = useState(false)
  const [selectedStageForBim, setSelectedStageForBim] = useState<string | null>(
    null,
  )

  if (!project) return <div>Projeto não encontrado</div>

  const handleImportBudget = () => {
    // Mock parsing of a file
    importExternalBudget(project.id, [
      { stageName: 'Fundação', material: 85000, labor: 42000 },
      { stageName: 'Alvenaria', material: 160000, labor: 95000 },
      { stageName: 'Instalações', material: 65000, labor: 52000 },
    ])
    setIsImportOpen(false)
    toast({
      title: 'Orçamento Importado',
      description:
        'Os valores estimados foram atualizados com base no arquivo CSV externo.',
    })
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {project.location}
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
          <TabsTrigger value="stages">Etapas da Obra</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="team">Equipe & Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="mt-6 space-y-6">
          {project.stages.map((stage) => {
            const {
              jobs: stageJobs,
              orders: stageOrders,
              totalBudget,
              totalActual,
            } = getStageFinancials(stage)
            const percent = Math.min(100, (totalActual / totalBudget) * 100)

            return (
              <Card
                key={stage.id}
                className="overflow-hidden border-l-4 border-l-primary"
              >
                <CardHeader className="bg-muted/20 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {stage.name}
                        {stage.status === 'completed' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </CardTitle>
                      <CardDescription>{stage.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Orçamento: R$ {totalBudget.toLocaleString('pt-BR')}
                      </div>
                      <div
                        className={`text-sm ${totalActual > totalBudget ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}
                      >
                        Executado: R$ {totalActual.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <Progress value={percent} className="h-2 mt-4" />
                </CardHeader>
                <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                  {/* Labor Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-orange-500" /> Mão de
                        Obra
                      </h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={`/post-job?projectId=${project.id}&stageId=${stage.id}`}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Contratar
                        </Link>
                      </Button>
                    </div>
                    {/* ... (Existing Labor details logic) ... */}
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Orçado</span>
                        <span>
                          R$ {stage.budgetLabor.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Realizado</span>
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
                        <Package className="h-4 w-4 text-blue-500" /> Materiais
                      </h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={`/construction/materials?projectId=${project.id}&stageId=${stage.id}`}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Comprar
                        </Link>
                      </Button>
                    </div>
                    {/* ... (Existing Materials details logic) ... */}
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Orçado</span>
                        <span>
                          R$ {stage.budgetMaterial.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Realizado</span>
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

                  {/* Suggestions Section */}
                  <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-purple-700 font-medium mb-3">
                      <UserCheck className="h-4 w-4" /> Sugestões Inteligentes
                      de Executores (IA)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-2 rounded border border-purple-100 bg-purple-50/50">
                        <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
                          A
                        </div>
                        <div>
                          <p className="text-sm font-medium">Andre Silva</p>
                          <p className="text-xs text-muted-foreground">
                            Certificado NR-18 • 98% Match
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-7 text-xs"
                        >
                          Convidar
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded border border-purple-100 bg-purple-50/50">
                        <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
                          R
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Roberto Construções
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Especialista Alvenaria • 95% Match
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-7 text-xs"
                        >
                          Convidar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="financial">
          {/* ... Existing Financial Content ... */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>
                  Consolidado de todas as etapas.
                </CardDescription>
              </div>
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Importar Orçamento (CSV)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Orçamento Externo</DialogTitle>
                    <DialogDescription>
                      Faça upload de um arquivo CSV ou Excel com as estimativas
                      atualizadas para comparação.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="font-medium">
                        Clique para selecionar o arquivo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        .CSV, .XLSX (Max 5MB)
                      </p>
                    </div>
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-xs flex gap-2">
                      <Upload className="h-4 w-4 shrink-0" />
                      Os valores importados substituirão as estimativas atuais
                      de todas as etapas correspondentes (Mapping: Etapa &rarr;
                      Material/Labor).
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleImportBudget}>
                      Processar Arquivo (Mock)
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
            <CardHeader>
              <CardTitle>Equipe Contratada</CardTitle>
              <CardDescription>
                Executores vinculados a este projeto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função/Job</TableHead>
                    <TableHead>Certificações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs
                    .filter((j) => j.acceptedBidId)
                    .map((job) => {
                      const bid = job.bids.find(
                        (b) => b.id === job.acceptedBidId,
                      )
                      if (!bid) return null

                      const hasCerts = Math.random() > 0.5

                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            {bid.executorName}
                          </TableCell>
                          <TableCell>{job.title}</TableCell>
                          <TableCell>
                            {hasCerts ? (
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />{' '}
                                Certificado BIDWORK
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                -
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {jobs.filter((j) => j.acceptedBidId).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum executor contratado ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
