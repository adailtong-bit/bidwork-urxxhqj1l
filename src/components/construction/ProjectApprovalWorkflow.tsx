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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Ruler,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProjectApprovalWorkflowProps {
  projectId: string
}

export function ProjectApprovalWorkflow({
  projectId,
}: ProjectApprovalWorkflowProps) {
  const {
    getProject,
    updateApprovalStatus,
    approveMeasurement,
    approveLedgerEntry,
  } = useProjectStore()
  const { t, formatDate, formatCurrency } = useLanguageStore()
  const { toast } = useToast()
  const project = getProject(projectId)

  if (!project) return null

  const handleStatusChange = (id: string, status: any) => {
    updateApprovalStatus(projectId, id, status, t('proj.approvals.manager'))
    toast({
      title: t('success'),
      description: `${t('status')} ${t('proj.approvals.' + status)}`,
    })
  }

  const handleApproveMeasurement = (id: string) => {
    approveMeasurement(projectId, id)
    toast({
      title: 'Medição Aprovada',
      description: 'Fatura gerada e progresso atualizado.',
    })
  }

  const handleApproveLedger = (id: string) => {
    approveLedgerEntry(projectId, id)
    toast({
      title: 'Serviço Aprovado',
      description: 'Execução do serviço confirmada com sucesso.',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">{t('proj.approvals.approved')}</Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">{t('proj.approvals.rejected')}</Badge>
        )
      case 'in_review':
        return (
          <Badge className="bg-yellow-500">
            {t('proj.approvals.in_review')}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{t('proj.approvals.pending')}</Badge>
    }
  }

  const getPartnerCompliance = (partnerId: string) => {
    const docs = project.complianceDocuments || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return docs.filter(
      (d) =>
        (d.partnerId === partnerId || d.partnerId === 'general') &&
        d.isCritical &&
        new Date(d.expirationDate) < today,
    )
  }

  const pendingMeasurements =
    project.measurements?.filter((m) => m.status === 'pending') || []

  const pendingLedgers =
    project.ledgerEntries?.filter((l) => l.executionStatus === 'pending') || []

  return (
    <div className="space-y-6">
      {pendingLedgers.length > 0 && (
        <Card className="w-full border-purple-200">
          <CardHeader className="bg-purple-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <CheckCircle2 className="h-5 w-5" /> Aprovação de Serviços e
              Fornecedores (Ledger)
            </CardTitle>
            <CardDescription>
              Valide a execução de serviços. O sistema bloqueia a aprovação caso
              o parceiro tenha documentação vencida.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço / Origem</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Custo Final</TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLedgers.map((l) => {
                    const partnerName =
                      project.partners?.find((p) => p.id === l.partnerId)
                        ?.companyName || 'N/A'
                    const expiredDocs = getPartnerCompliance(l.partnerId)
                    const isBlocked = expiredDocs.length > 0

                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <span className="font-medium">{l.description}</span>
                          <span className="text-xs text-muted-foreground block">
                            {l.origin}
                          </span>
                        </TableCell>
                        <TableCell>{partnerName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(l.finalCost)}
                        </TableCell>
                        <TableCell className="text-center">
                          {isBlocked ? (
                            <Badge variant="destructive">
                              Bloqueado ({expiredDocs.length})
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500">Regular</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isBlocked ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-block cursor-not-allowed">
                                    <Button
                                      size="sm"
                                      disabled
                                      className="pointer-events-none"
                                    >
                                      <XCircle className="mr-1 h-4 w-4" />{' '}
                                      Bloqueado
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-red-50 text-red-900 border-red-200">
                                  Docs Vencidos:{' '}
                                  {expiredDocs.map((d) => d.name).join(', ')}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApproveLedger(l.id)}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Aprovar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingMeasurements.length > 0 && (
        <Card className="w-full border-blue-200">
          <CardHeader className="bg-blue-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Ruler className="h-5 w-5" /> Aprovação de Medições (Parceiros)
            </CardTitle>
            <CardDescription>
              Valide o percentual executado para liberar faturamento automático.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Tarefa / Fase</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead className="text-right">
                      Progresso Solicitado
                    </TableHead>
                    <TableHead className="text-right">
                      Valor a Liberar
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingMeasurements.map((m) => {
                    const partner = project.partners?.find(
                      (p) => p.id === m.partnerId,
                    )
                    const stageName =
                      project.stages.find((s) => s.id === m.stageId)?.name || ''
                    const subName =
                      project.stages
                        .find((s) => s.id === m.stageId)
                        ?.subStages.find((sub) => sub.id === m.subStageId)
                        ?.name || ''

                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          {formatDate(m.date, 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{subName}</span>
                          <span className="text-xs text-muted-foreground block">
                            {stageName}
                          </span>
                        </TableCell>
                        <TableCell>{partner?.companyName}</TableCell>
                        <TableCell className="text-right font-bold">
                          {m.requestedPercentage}%
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(m.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">Pendente</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleApproveMeasurement(m.id)}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Aprovar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('proj.approvals.title')}</CardTitle>
          <CardDescription>{t('proj.approvals.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('proj.approvals.type')}</TableHead>
                  <TableHead>{t('proj.approvals.description')}</TableHead>
                  <TableHead>{t('proj.approvals.date')}</TableHead>
                  <TableHead>{t('proj.approvals.status')}</TableHead>
                  <TableHead>{t('proj.approvals.history')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.approvalLogs && project.approvalLogs.length > 0 ? (
                  project.approvalLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="capitalize flex items-center gap-2">
                        {log.type === 'invoice' ? (
                          <FileText className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                        {log.type}
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>
                        {formatDate(log.date, 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {log.history.length} {t('proj.approvals.changes')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(log.id, 'approved')
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              {t('proj.approvals.approved')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(log.id, 'in_review')
                              }
                            >
                              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                              {t('proj.approvals.in_review')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(log.id, 'rejected')
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              {t('proj.approvals.rejected')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('proj.approvals.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
