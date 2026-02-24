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
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProjectApprovalWorkflowProps {
  projectId: string
}

export function ProjectApprovalWorkflow({
  projectId,
}: ProjectApprovalWorkflowProps) {
  const { getProject, updateApprovalStatus } = useProjectStore()
  const { t, formatDate } = useLanguageStore()
  const { toast } = useToast()
  const project = getProject(projectId)

  if (!project) return null

  const handleStatusChange = (id: string, status: any) => {
    updateApprovalStatus(projectId, id, status, t('proj.approvals.manager')) // Mock user
    toast({
      title: t('success'),
      description: `${t('status')} ${t('proj.approvals.' + status)}`,
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

  return (
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
                    <TableCell>{formatDate(log.date, 'dd/MM/yyyy')}</TableCell>
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
  )
}
