import { useAuthStore } from '@/stores/useAuthStore'
import { useProjectStore } from '@/stores/useProjectStore'
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
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'
import { TeamMemberModal } from '@/components/partner/TeamMemberModal'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function PartnerDashboard() {
  const { user } = useAuthStore()
  const { projects, generateInvoice, rateTeamMember } = useProjectStore()
  const { toast } = useToast()

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  )
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  )

  // Find assigned projects
  // In a real app, we'd filter by user.id mapping to partner.id,
  // here we'll assume the logged in partner corresponds to 'partner-1' for demo
  const partnerProjects = projects.filter((p) =>
    p.partners.some((part) => part.id === 'partner-1'),
  )
  const activePartner = partnerProjects[0]?.partners.find(
    (p) => p.id === 'partner-1',
  )

  const handleGenerateInvoice = (
    projId: string,
    stageId: string,
    subId: string,
  ) => {
    generateInvoice(projId, stageId, subId, 'partner_to_contractor')
    toast({
      title: 'Fatura Enviada',
      description: 'O contratante recebeu sua solicitação de pagamento.',
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
            Bem-vindo, {activePartner?.companyName || user?.name}
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
            <CardTitle className="text-sm font-medium">Obras Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipe Registrada
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
            <CardTitle className="text-sm font-medium">
              Faturamento Pendente
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {activePartner?.agreedPrice.toLocaleString('pt-BR') || '0,00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Meus Projetos</TabsTrigger>
          <TabsTrigger value="team">Gestão de Equipe</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6 mt-4">
          {partnerProjects.map((proj) => (
            <Card key={proj.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{proj.name}</CardTitle>
                    <CardDescription>{proj.location}</CardDescription>
                  </div>
                  <Badge>{proj.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-4">Suas Atividades:</h3>
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
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                if (activePartner && partnerProjects.length > 0) {
                  setSelectedPartnerId(activePartner.id)
                  setSelectedProjectId(partnerProjects[0].id)
                  setIsTeamModalOpen(true)
                }
              }}
            >
              <Users className="mr-2 h-4 w-4" /> Adicionar Membro
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Membros da Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              {activePartner?.team.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum membro registrado.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activePartner?.team.map((member) => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold">{member.name}</span>
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{member.email}</p>
                        <p>{member.phone}</p>
                        <p className="text-xs mt-1">
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
              <CardTitle>Faturas e Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerProjects
                  .flatMap((p) => p.stages.flatMap((s) => s.subStages))
                  .filter((sub) => sub.status === 'completed')
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center border p-4 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Preço: R${' '}
                          {sub.taskPrice?.toLocaleString('pt-BR') || '-'}
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
                            } // simplified logic for demo
                          >
                            Gerar Fatura
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                {partnerProjects
                  .flatMap((p) => p.stages.flatMap((s) => s.subStages))
                  .filter((sub) => sub.status === 'completed').length === 0 && (
                  <div className="text-center text-muted-foreground">
                    Nenhuma atividade concluída para faturar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedPartnerId && selectedProjectId && (
        <TeamMemberModal
          open={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          partnerId={selectedPartnerId}
          projectId={selectedProjectId}
        />
      )}
    </div>
  )
}
