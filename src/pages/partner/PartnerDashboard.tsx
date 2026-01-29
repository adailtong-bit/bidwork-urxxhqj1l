import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useContractorStore } from '@/stores/useContractorStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Building2, Users, FileText, Star, Plus, UserCheck } from 'lucide-react'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'
import { TeamMemberModal } from '@/components/partner/TeamMemberModal'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function PartnerDashboard() {
  const { user } = useAuthStore()
  const { projects, generateInvoice, addPartnerTeamMember } = useProjectStore()
  const { contractors } = useContractorStore()
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false)
  const [selectedContractorId, setSelectedContractorId] = useState('')

  // Assume current logged in partner is 'partner-1' for demo
  const partnerId = 'partner-1'

  const partnerProjects = projects.filter((p) =>
    p.partners.some((part) => part.id === partnerId),
  )
  const activePartner = partnerProjects[0]?.partners.find(
    (p) => p.id === partnerId,
  )

  // Get available contractors from pool (not yet in team? logic depends on requirement)
  // Story: "Select contractors and add them to their permanent team roster"
  const availableContractors = contractors.filter(
    (c) => c.status === 'available',
  )

  const handleAddFromPool = () => {
    if (!selectedContractorId || !activePartner) return
    const contractor = contractors.find((c) => c.id === selectedContractorId)

    if (contractor && partnerProjects.length > 0) {
      // Add to first project as example, or user should select project context
      // User Story implies adding to "permanent team roster".
      // The current data structure links team members to a specific project partner entry.
      // We'll add to the first project for now to satisfy the "Project Activity Assignment" prerequisite.

      const projectId = partnerProjects[0].id

      addPartnerTeamMember(projectId, activePartner.id, {
        name: contractor.name,
        role: contractor.role as any,
        email: contractor.email,
        phone: contractor.phone,
        registrationId: contractor.id, // Linking ID
      })

      toast({ title: 'Profissional adicionado à equipe' })
      setIsPoolModalOpen(false)
      setSelectedContractorId('')
    }
  }

  const handleGenerateInvoice = (
    projId: string,
    stageId: string,
    subId: string,
  ) => {
    generateInvoice(projId, stageId, subId, 'partner_to_contractor')
    toast({
      title: 'Fatura Enviada',
      description: 'Solicitação de pagamento enviada ao contratante.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Painel do Parceiro
          </h1>
          <p className="text-muted-foreground">
            Gestão de Obras e Equipes |{' '}
            {activePartner?.companyName || user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-lg py-1 px-3 bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Star className="w-4 h-4 mr-1 fill-current" />
            Score: {activePartner?.performanceScore || 0}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipe Alocada
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePartner?.team.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebíveis</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(activePartner?.agreedPrice || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Meus Projetos</TabsTrigger>
          <TabsTrigger value="team">Minha Equipe</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6 mt-4">
          {partnerProjects.map((proj) => (
            <Card key={proj.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{proj.name}</CardTitle>
                    <CardDescription>{proj.location}</CardDescription>
                  </div>
                  <Badge>{proj.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 bg-muted/30 p-3 rounded-lg border text-sm">
                  <p className="font-semibold text-primary mb-1">
                    Suas Atividades Atribuídas:
                  </p>
                  <p className="text-muted-foreground">
                    Gerencie o progresso e aloque sua equipe nas tarefas abaixo.
                  </p>
                </div>
                <ProjectScheduleTable
                  projectId={proj.id}
                  stages={proj.stages}
                  partners={proj.partners}
                  isPartnerView={true}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => setIsPoolModalOpen(true)}>
              <UserCheck className="mr-2 h-4 w-4" /> Buscar no Banco de Talentos
            </Button>
            <Button onClick={() => setIsTeamModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Membro
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                Profissionais vinculados à sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePartner?.team.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhum miembro registrado. Adicione manualmente ou busque no
                  banco de talentos.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activePartner?.team.map((member) => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold">{member.name}</span>
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <span className="text-xs uppercase font-semibold">
                            Email:
                          </span>{' '}
                          {member.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-xs uppercase font-semibold">
                            Tel:
                          </span>{' '}
                          {member.phone}
                        </p>
                        <p className="text-xs mt-2 bg-muted p-1 rounded w-fit">
                          ID: {member.registrationId}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Faturas</CardTitle>
              <CardDescription>
                Emita cobranças para atividades concluídas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerProjects
                  .flatMap((p) => p.stages.flatMap((s) => s.subStages))
                  .filter((sub) => sub.status === 'completed')
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center border p-4 rounded-lg bg-card"
                    >
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Valor: {formatCurrency(sub.taskPrice || 0)}
                        </p>
                      </div>
                      <div>
                        {sub.invoiceStatus === 'paid' ? (
                          <Badge className="bg-green-500">Pago</Badge>
                        ) : sub.invoiceStatus === 'sent_to_contractor' ? (
                          <Badge variant="secondary">Enviado</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleGenerateInvoice(
                                partnerProjects[0].id,
                                'any',
                                sub.id,
                              )
                            }
                          >
                            <FileText className="mr-2 h-4 w-4" /> Gerar Fatura
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                {partnerProjects
                  .flatMap((p) => p.stages.flatMap((s) => s.subStages))
                  .filter((sub) => sub.status === 'completed').length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma actividad concluída disponible para facturación.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Add Modal */}
      {activePartner && partnerProjects.length > 0 && (
        <TeamMemberModal
          open={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          partnerId={activePartner.id}
          projectId={partnerProjects[0].id}
        />
      )}

      {/* Pool Selection Modal */}
      <Dialog open={isPoolModalOpen} onOpenChange={setIsPoolModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar do Banco de Talentos</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>Profissionais Disponíveis</Label>
            <Select onValueChange={setSelectedContractorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional..." />
              </SelectTrigger>
              <SelectContent>
                {availableContractors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Adicionando este profissional à sua equipe permanente.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddFromPool}
              disabled={!selectedContractorId}
            >
              Adicionar à Equipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
