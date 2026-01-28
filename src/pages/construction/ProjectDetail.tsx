import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore, ProjectPartner } from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Calendar as CalendarIcon,
  LayoutList,
  LayoutGrid,
  FileSpreadsheet,
  Upload,
  Edit2,
  Phone,
  Users,
  HardHat,
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'
import { PartnerEditModal } from '@/components/partner/PartnerEditModal'
import { ProjectTeamManager } from '@/components/construction/ProjectTeamManager'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject } = useProjectStore()
  const { toast } = useToast()

  const csvInputRef = useRef<HTMLInputElement>(null)
  const project = getProject(id!)

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<ProjectPartner | null>(
    null,
  )
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false)

  if (!project)
    return <div className="p-8 text-center">Projeto não encontrado</div>

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: 'Simulação de Upload',
      description: 'Arquivo processado com sucesso.',
    })
    setIsImportOpen(false)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center gap-4 py-4 relative">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="absolute left-0 top-4 md:top-auto md:static"
          >
            <Link to="/construction/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Badge
            variant={project.status === 'in_progress' ? 'default' : 'secondary'}
          >
            {project.status === 'in_progress' ? 'Em Andamento' : project.status}
          </Badge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {project.name}
        </h1>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded-full">
            <MapPin className="h-3 w-3" />
            {project.address
              ? `${project.address.city} - ${project.address.state}`
              : project.location}
          </span>
          <span className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded-full">
            <CalendarIcon className="h-3 w-3" />{' '}
            {format(project.startDate, 'dd/MM/yyyy')} -{' '}
            {format(project.endDate, 'dd/MM/yyyy')}
          </span>
        </div>

        {/* Team Manager Button */}
        <Button
          className="absolute right-0 top-4 md:top-auto"
          variant="outline"
          onClick={() => setIsTeamManagerOpen(true)}
        >
          <HardHat className="mr-2 h-4 w-4" /> Equipe Técnica
        </Button>
      </div>

      <Tabs defaultValue="stages" className="w-full flex flex-col items-center">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="stages">Cronograma</TabsTrigger>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent
          value="stages"
          className="w-full space-y-6 animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium mr-2">Visualização:</span>
              <div className="flex bg-muted p-1 rounded-md">
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
                  <LayoutList className="mr-2 h-3 w-3" /> Tabela
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar CSV
            </Button>
          </div>

          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            {viewMode === 'table' ? (
              <ProjectScheduleTable
                projectId={project.id}
                stages={project.stages}
                partners={project.partners}
              />
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                Visualização em Cards simplificada. Use a Tabela para gestão
                detalhada.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="partners" className="w-full animate-fade-in">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Empresas Parceiras</CardTitle>
                  <CardDescription>
                    Gestão de contratos e equipes alocadas.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {project.partners && project.partners.length > 0 ? (
                <div className="grid gap-6">
                  {project.partners.map((partner) => (
                    <div
                      key={partner.id}
                      className="border rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                          <h3 className="font-bold text-xl text-primary">
                            {partner.companyName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              Etapa:{' '}
                              {project.stages.find(
                                (s) => s.id === partner.stageId,
                              )?.name || 'Geral'}
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                              Score: {partner.performanceScore}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPartner(partner)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Gerenciar
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Phone className="h-3 w-3" /> Contatos
                          </h4>
                          {partner.contacts.length > 0 ? (
                            <ul className="space-y-2">
                              {partner.contacts.map((c) => (
                                <li
                                  key={c.id}
                                  className="text-sm flex justify-between items-center bg-muted/30 p-2 rounded"
                                >
                                  <span className="font-medium">{c.name}</span>
                                  <span className="text-muted-foreground text-xs">
                                    {c.phone}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Nenhum contato cadastrado.
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Users className="h-3 w-3" /> Equipe Técnica
                          </h4>
                          {partner.team.length > 0 ? (
                            <ul className="space-y-2">
                              {partner.team.map((m) => (
                                <li
                                  key={m.id}
                                  className="text-sm flex justify-between items-center bg-muted/30 p-2 rounded"
                                >
                                  <span className="font-medium">{m.name}</span>
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {m.role}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Nenhuma equipe alocada.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                  Nenhum parceiro registrado neste projeto.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="w-full animate-fade-in">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Visão Financeira do Projeto</CardTitle>
              <CardDescription>
                Acompanhamento de custos e pagamentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Módulo Financeiro Integrado
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Para detalhes completos de faturamento e fluxo de caixa, acesse
                o
                <Link
                  to="/finance"
                  className="text-primary hover:underline ml-1 font-medium"
                >
                  Dashboard Financeiro
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Dados</DialogTitle>
          </DialogHeader>
          <div
            className="py-12 text-center cursor-pointer border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Clique para selecionar arquivo .CSV</p>
            <p className="text-xs text-muted-foreground mt-1">
              Suporta Project ou Excel
            </p>
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

      {/* Team Manager Sheet */}
      <ProjectTeamManager
        open={isTeamManagerOpen}
        onClose={() => setIsTeamManagerOpen(false)}
        projectId={project.id}
      />
    </div>
  )
}
