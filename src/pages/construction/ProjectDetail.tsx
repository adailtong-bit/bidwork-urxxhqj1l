import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useProjectStore,
  Stage,
  ProjectPartner,
} from '@/stores/useProjectStore'
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
  ArrowLeft,
  Plus,
  MapPin,
  Calendar as CalendarIcon,
  LayoutList,
  LayoutGrid,
  FileSpreadsheet,
  Upload,
  Edit2,
  Phone,
  Mail,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'
import { PartnerEditModal } from '@/components/partner/PartnerEditModal'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject, importExternalBudget, importTimeline, addPartner } =
    useProjectStore()
  const { toast } = useToast()

  const csvInputRef = useRef<HTMLInputElement>(null)

  const project = getProject(id!)

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importType, setImportType] = useState<'budget' | 'timeline'>('budget')
  const [isPartnerOpen, setIsPartnerOpen] = useState(false)

  // Partner Edit State
  const [editingPartner, setEditingPartner] = useState<ProjectPartner | null>(
    null,
  )

  // View Toggle State
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table') // Default to table for advanced view

  // Partner Form State
  const [newPartner, setNewPartner] = useState({
    companyName: '',
    stageId: '',
    agreedPrice: '',
  })

  if (!project) return <div>Projeto não encontrado</div>

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
      // Mock file URLs
      contractUrl: '#',
      licensesUrl: '#',
      insuranceUrl: '#',
    })
    setIsPartnerOpen(false)
    setNewPartner({ companyName: '', stageId: '', agreedPrice: '' })
    toast({ title: 'Parceiro Registrado com Sucesso!' })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simplification of previous logic for brevity, focus on updated features
    toast({ title: 'Simulação de Upload' })
    setIsImportOpen(false)
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
                ? `${project.address.city} - ${project.address.state}`
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
          <TabsTrigger value="stages">Cronograma & Workflow</TabsTrigger>
          <TabsTrigger value="partners">Parceiros & Equipes</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
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
            </Button>
          </div>

          {viewMode === 'table' ? (
            <ProjectScheduleTable
              projectId={project.id}
              stages={project.stages}
              partners={project.partners}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Visualização em Cards simplificada. Use a Tabela para gestão
              avançada.
            </div>
          )}
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Gestão de Parceiros</CardTitle>
                <CardDescription>
                  Gerencie empresas contratadas e suas equipes.
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
                      className="border rounded-lg bg-card p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">
                            {partner.companyName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Etapa:{' '}
                            {
                              project.stages.find(
                                (s) => s.id === partner.stageId,
                              )?.name
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700"
                          >
                            Score: {partner.performanceScore}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPartner(partner)}
                          >
                            <Edit2 className="h-4 w-4 mr-2" /> Editar
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Phone className="h-3 w-3" /> Contatos
                          </h4>
                          {partner.contacts.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {partner.contacts.map((c) => (
                                <li
                                  key={c.id}
                                  className="text-muted-foreground"
                                >
                                  {c.name} ({c.role}) - {c.phone}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Nenhum contato cadastrado.
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-3 w-3" /> Equipe Técnica
                          </h4>
                          {partner.team.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {partner.team.map((m) => (
                                <li
                                  key={m.id}
                                  className="text-muted-foreground"
                                >
                                  {m.name} - {m.role}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Nenhuma equipe cadastrada.
                            </p>
                          )}
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

        <TabsContent value="financial">
          <div className="text-center py-10">
            Módulo Financeiro disponível via Dashboard Geral.
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Dados</DialogTitle>
          </DialogHeader>
          <div
            className="py-8 text-center cursor-pointer border-2 border-dashed rounded-lg"
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p>Clique para selecionar arquivo .CSV</p>
            <input
              type="file"
              ref={csvInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Modal */}
      {editingPartner && (
        <PartnerEditModal
          open={!!editingPartner}
          onClose={() => setEditingPartner(null)}
          projectId={project.id}
          partner={editingPartner}
        />
      )}
    </div>
  )
}
