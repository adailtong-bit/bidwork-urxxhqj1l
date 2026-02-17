import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore, ProjectPartner } from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Link2,
  TrendingDown,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'
import { PartnerEditModal } from '@/components/partner/PartnerEditModal'
import { ProjectTeamManager } from '@/components/construction/ProjectTeamManager'
import { ProjectBudget } from '@/components/construction/ProjectBudget'
import { ProjectReports } from '@/components/construction/ProjectReports'
import { ProjectApprovalWorkflow } from '@/components/construction/ProjectApprovalWorkflow'
import { ExternalIntegrationDialog } from '@/components/construction/ExternalIntegrationDialog'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectEstimationTable } from '@/components/construction/ProjectEstimationTable'
import { TemplateSelector } from '@/components/construction/TemplateSelector'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject, setProjectSqFt } = useProjectStore()
  const { toast } = useToast()
  const { t, formatDate, formatCurrency, currentLanguage } = useLanguageStore()

  const csvInputRef = useRef<HTMLInputElement>(null)
  const project = getProject(id!)

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<ProjectPartner | null>(
    null,
  )
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false)
  const [isSyncOpen, setIsSyncOpen] = useState(false)

  // Estimation State
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)

  if (!project) return <div className="p-8 text-center">{t('error')}</div>

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: 'Simulação de Upload',
      description: 'Arquivo processado com sucesso.',
    })
    setIsImportOpen(false)
  }

  // Finance Inline Calculations
  const allocated =
    project.allocatedCosts?.reduce((acc, c) => acc + c.amount, 0) || 0
  const realTotalSpent = project.totalSpent + allocated

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10 px-4">
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
            {t(`status.${project.status}`)}
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
            {formatDate(project.startDate, 'P')} -{' '}
            {formatDate(project.endDate, 'P')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute right-0 top-4 md:top-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSyncOpen(true)}
            title={t('proj.sync.btn')}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setIsTeamManagerOpen(true)}>
            <HardHat className="mr-2 h-4 w-4" /> {t('proj.team.btn')}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="estimation"
        className="w-full flex flex-col items-center"
      >
        {/* Responsive Horizontal Scroll Tabs */}
        <div className="w-full overflow-x-auto pb-2 -mb-2">
          <TabsList className="w-full max-w-4xl flex-nowrap justify-start md:justify-center min-w-[700px] mb-8 h-auto p-1">
            <TabsTrigger value="estimation" className="flex-1">
              {t('est.tab.title')}
            </TabsTrigger>
            <TabsTrigger value="stages" className="flex-1">
              {t('proj.detail.schedule')}
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex-1">
              {t('proj.budget.title')}
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex-1">
              {t('proj.detail.partners')}
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex-1">
              {t('proj.approvals.title')}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">
              {t('proj.reports.title')}
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex-1">
              {t('proj.detail.finance')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="estimation"
          className="w-full animate-fade-in space-y-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>{t('est.tab.title')}</CardTitle>
                <CardDescription>
                  Planejamento e estimativa de custos por etapa ou m².
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border rounded-md p-1 mr-4">
                  <span className="text-xs font-medium px-2">
                    {t('est.project.sqft')}:
                  </span>
                  <Input
                    type="number"
                    className="h-7 w-20 text-right"
                    value={project.sqFt || ''}
                    placeholder="0"
                    onChange={(e) =>
                      setProjectSqFt(project.id, parseFloat(e.target.value))
                    }
                  />
                </div>
                <Button
                  onClick={() => setIsTemplateSelectorOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />{' '}
                  {t('est.template.select')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.constructionItems &&
              project.constructionItems.length > 0 ? (
                <ProjectEstimationTable projectId={project.id} />
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/5">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    {t('est.template.select')}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Comece selecionando um modelo padrão ou faça o upload de sua
                    lista personalizada.
                  </p>
                  <Button onClick={() => setIsTemplateSelectorOpen(true)}>
                    {t('est.template.select')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="stages"
          className="w-full space-y-6 animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium mr-2">
                {t('proj.view_label')}
              </span>
              <div className="flex bg-muted p-1 rounded-md">
                <Button
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid className="mr-2 h-3 w-3" /> {t('proj.view.cards')}
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setViewMode('table')}
                >
                  <LayoutList className="mr-2 h-3 w-3" /> {t('proj.view.table')}
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> {t('proj.import')}
            </Button>
          </div>

          <div className="rounded-xl overflow-hidden">
            {viewMode === 'table' ? (
              <div className="bg-card border shadow-sm rounded-xl">
                <ProjectScheduleTable
                  projectId={project.id}
                  stages={project.stages}
                  partners={project.partners}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.stages.map((stage) => (
                  <Card
                    key={stage.id}
                    className="h-full flex flex-col hover:border-primary/50 transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge
                          variant="outline"
                          className={
                            stage.status === 'completed'
                              ? 'bg-green-50 text-green-700'
                              : ''
                          }
                        >
                          {t(`status.${stage.status}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(
                            stage.startDate,
                            currentLanguage === 'en' ? 'MM/dd' : 'dd/MM',
                          )}
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight mt-2">
                        {t(stage.name)}
                      </CardTitle>
                      <Progress value={stage.progress} className="h-1.5 mt-2" />
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3 mt-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          {t('proj.stage.tasks')}
                        </h4>
                        {stage.subStages.length > 0 ? (
                          <ul className="space-y-2">
                            {stage.subStages.map((sub) => (
                              <li
                                key={sub.id}
                                className="text-sm flex items-center gap-2 bg-muted/30 p-2 rounded"
                              >
                                {sub.status === 'completed' ? (
                                  <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                                )}
                                <span
                                  className={
                                    sub.status === 'completed'
                                      ? 'line-through text-muted-foreground'
                                      : ''
                                  }
                                >
                                  {t(sub.name)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            {t('proj.tasks.empty')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="w-full animate-fade-in">
          <ProjectBudget projectId={project.id} />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="w-full animate-fade-in">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t('proj.detail.partners')}</CardTitle>
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
                              {t('proj.partner.stage')}:{' '}
                              {t(
                                project.stages.find(
                                  (s) => s.id === partner.stageId,
                                )?.name || 'Geral',
                              )}
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                              {t('proj.partner.score')}:{' '}
                              {partner.performanceScore}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPartner(partner)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> {t('edit')}
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Phone className="h-3 w-3" />{' '}
                            {t('proj.partner.contacts')}
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
                              {t('proj.partner.no_contacts')}
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Users className="h-3 w-3" /> {t('proj.team.btn')}
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
                                    {t(
                                      `role.${m.role.toLowerCase().replace(' ', '_')}`,
                                    ) || m.role}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              {t('proj.partner.no_team')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                  {t('proj.partners.empty')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="w-full animate-fade-in">
          <ProjectReports projectId={project.id} />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="w-full animate-fade-in">
          <ProjectApprovalWorkflow projectId={project.id} />
        </TabsContent>

        {/* Inline Financial Tab */}
        <TabsContent value="financial" className="w-full animate-fade-in">
          <div className="space-y-6">
            <Card className="max-w-4xl mx-auto border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>{t('proj.finance.title')}</CardTitle>
                <CardDescription>
                  Resumo financeiro direto e custos alocados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-sm text-green-800 font-medium">
                      {t('proj.finance.inflow')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-700">
                        {formatCurrency(project.totalBudget)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('proj.finance.approved_budget')}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-sm text-red-800 font-medium">
                      {t('proj.finance.outflow')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="text-2xl font-bold text-red-700">
                        {formatCurrency(realTotalSpent)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('proj.finance.costs_allocated')}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800 font-medium">
                      {t('proj.finance.balance')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-700">
                        {formatCurrency(project.totalBudget - realTotalSpent)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('proj.finance.available')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {t('proj.finance.allocated_costs')}
                  </h3>
                  <div className="border rounded-md">
                    {project.allocatedCosts &&
                    project.allocatedCosts.length > 0 ? (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-3 font-medium">
                              {t('finance.description')}
                            </th>
                            <th className="p-3 font-medium">
                              {t('market.category')}
                            </th>
                            <th className="p-3 font-medium text-right">
                              {t('dashboard.chart.label.value')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.allocatedCosts.map((cost) => (
                            <tr
                              key={cost.id}
                              className="border-b last:border-0"
                            >
                              <td className="p-3">{cost.description}</td>
                              <td className="p-3 capitalize">
                                {cost.category}
                              </td>
                              <td className="p-3 text-right">
                                {formatCurrency(cost.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground italic">
                        {t('proj.finance.no_allocated')}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('proj.import')}</DialogTitle>
          </DialogHeader>
          <div
            className="py-12 text-center cursor-pointer border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">{t('proj.import.drag_drop')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('proj.import.formats')}
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

      {/* Template Selector Dialog */}
      <TemplateSelector
        open={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        projectId={project.id}
      />

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

      {/* External Integration Dialog */}
      <ExternalIntegrationDialog
        open={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        projectId={project.id}
      />
    </div>
  )
}
