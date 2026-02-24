import { useState, Fragment } from 'react'
import {
  Stage,
  useProjectStore,
  ProjectPartner,
} from '@/stores/useProjectStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  AlertCircle,
  Plus,
  Trash2,
  UserPlus,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CurrencyInput } from '@/components/CurrencyInput'

interface ProjectScheduleTableProps {
  projectId: string
  stages: Stage[]
  partners?: ProjectPartner[]
  isPartnerView?: boolean
}

export function ProjectScheduleTable({
  projectId,
  stages = [],
  partners = [],
  isPartnerView = false,
}: ProjectScheduleTableProps) {
  const { updateStage, updateSubStage, addSubStage, deleteSubStage } =
    useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set((stages || []).map((s) => s.id)),
  )
  const [newItem, setNewItem] = useState<{
    parentId: string
    name: string
  } | null>(null)

  // Deletion State
  const [deleteData, setDeleteData] = useState<{
    stageId: string
    subStageId: string
  } | null>(null)
  const [deleteStep, setDeleteStep] = useState(0)

  // Assignment State
  const [assignData, setAssignData] = useState<{
    stageId: string
    subStageId: string
  } | null>(null)
  const [selectedMember, setSelectedMember] = useState('')
  const [taskPrice, setTaskPrice] = useState<number>(0)

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedStages)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedStages(newSet)
  }

  const handleUpdateProgress = (
    stageId: string,
    subStageId: string | null,
    value: number,
  ) => {
    const clamped = Math.max(0, Math.min(100, value))
    const status =
      clamped === 100 ? 'completed' : clamped > 0 ? 'in_progress' : 'pending'

    if (subStageId) {
      updateSubStage(projectId, stageId, subStageId, {
        progress: clamped,
        status,
      })
    } else {
      updateStage(projectId, stageId, { progress: clamped, status })
    }
  }

  const handleToggleStatus = (stageId: string, subStageId: string) => {
    const stage = stages.find((s) => s.id === stageId)
    const sub = stage?.subStages.find((ss) => ss.id === subStageId)
    if (!sub) return

    const newStatus = sub.status === 'completed' ? 'in_progress' : 'completed'
    const newProgress = newStatus === 'completed' ? 100 : 50
    updateSubStage(projectId, stageId, subStageId, {
      status: newStatus,
      progress: newProgress,
    })
  }

  const handleToggleDelay = (
    stageId: string,
    subStageId: string | null,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === 'delayed' ? 'in_progress' : 'delayed'
    if (subStageId) {
      updateSubStage(projectId, stageId, subStageId, { status: newStatus })
    } else {
      updateStage(projectId, stageId, { status: newStatus as any })
    }
  }

  const handleAddSubStage = (stageId: string) => {
    if (newItem?.parentId === stageId && newItem.name) {
      addSubStage(projectId, stageId, {
        name: newItem.name,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 7),
        progress: 0,
        status: 'pending',
      })
      setNewItem(null)
    } else {
      setNewItem({ parentId: stageId, name: '' })
    }
  }

  const handleDeleteClick = (stageId: string, subStageId: string) => {
    setDeleteData({ stageId, subStageId })
    setDeleteStep(1)
  }

  const handleConfirmDelete = () => {
    if (deleteStep === 1) {
      setDeleteStep(2)
    } else if (deleteStep === 2 && deleteData) {
      deleteSubStage(projectId, deleteData.stageId, deleteData.subStageId)
      setDeleteData(null)
      setDeleteStep(0)
    }
  }

  const handleAssign = () => {
    if (assignData && selectedMember && taskPrice) {
      updateSubStage(projectId, assignData.stageId, assignData.subStageId, {
        assignedTeamMemberId: selectedMember,
        taskPrice: taskPrice,
      })
      setAssignData(null)
      setSelectedMember('')
      setTaskPrice(0)
    }
  }

  const safeStages = Array.isArray(stages) ? stages : []

  const availablePartners =
    isPartnerView && partners.length > 0 ? [partners[0]] : partners
  const teamMembersToSelect = availablePartners.flatMap((p) =>
    p.team.map((m) => ({ ...m, partnerName: p.companyName })),
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[300px]">{t('proj.stage.tasks')}</TableHead>
            <TableHead>{t('construction.start')}</TableHead>
            <TableHead>{t('sched.end')}</TableHead>
            <TableHead className="w-[180px]">
              {t('proj.task.progress')}
            </TableHead>
            <TableHead>{t('proj.task.status')}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeStages.map((stage) => (
            <Fragment key={stage.id}>
              {/* Stage Row */}
              <TableRow className="hover:bg-muted/30 font-semibold bg-muted/5">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleExpand(stage.id)}
                    >
                      {expandedStages.has(stage.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="truncate" title={stage.name}>
                      {t(stage.name)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(stage.startDate, 'P')}</TableCell>
                <TableCell>{formatDate(stage.endDate, 'P')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={stage.progress}
                      className={cn(
                        'h-2 flex-1',
                        stage.status === 'delayed' ? 'bg-red-100' : '',
                      )}
                    />
                    <span className="text-xs">{stage.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t(`status.${stage.status}`)}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setNewItem({ parentId: stage.id, name: '' })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('sched.add_activity')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>

              {/* SubStages */}
              {expandedStages.has(stage.id) && (
                <>
                  {stage.subStages?.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="bg-white hover:bg-muted/10"
                    >
                      <TableCell className="pl-12">
                        <div className="flex flex-col border-l-2 border-muted pl-3">
                          <span
                            className="truncate text-sm font-medium"
                            title={sub.name}
                          >
                            {t(sub.name)}
                          </span>
                          {sub.assignedTeamMemberId && (
                            <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                              <UserPlus className="h-3 w-3" />
                              {partners
                                .flatMap((p) => p.team)
                                .find((m) => m.id === sub.assignedTeamMemberId)
                                ?.name || t('sched.team_member_fallback')}
                              {sub.taskPrice &&
                                ` • ${formatCurrency(sub.taskPrice)}`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(sub.startDate, 'P')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(sub.endDate, 'P')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={sub.progress}
                            className="h-1.5 flex-1"
                          />
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="h-7 w-16 text-right text-xs"
                            value={sub.progress}
                            onChange={(e) =>
                              handleUpdateProgress(
                                stage.id,
                                sub.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] h-5 cursor-pointer hover:opacity-80',
                            sub.status === 'delayed'
                              ? 'text-red-600 border-red-200 bg-red-50'
                              : sub.status === 'completed'
                                ? 'text-green-600 border-green-200 bg-green-50'
                                : '',
                          )}
                          onClick={() => handleToggleStatus(stage.id, sub.id)}
                        >
                          {t(`status.${sub.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setAssignData({
                                  stageId: stage.id,
                                  subStageId: sub.id,
                                })
                              }
                            >
                              <UserPlus className="mr-2 h-4 w-4" />{' '}
                              {t('sched.allocate_labor')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(stage.id, sub.id)
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {sub.status === 'completed'
                                ? t('sched.reopen')
                                : t('confirm')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleDelay(stage.id, sub.id, sub.status)
                              }
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              {sub.status === 'delayed'
                                ? t('sched.remove_delay')
                                : t('sched.mark_delay')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleDeleteClick(stage.id, sub.id)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> {t('remove')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Add SubStage Row */}
                  {newItem?.parentId === stage.id && (
                    <TableRow className="bg-muted/10">
                      <TableCell className="pl-12">
                        <div className="flex items-center gap-2 border-l-2 border-muted pl-3">
                          <Input
                            autoFocus
                            placeholder={t('sched.new_activity.placeholder')}
                            className="h-8"
                            value={newItem.name}
                            onChange={(e) =>
                              setNewItem({ ...newItem, name: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddSubStage(stage.id)
                              if (e.key === 'Escape') setNewItem(null)
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddSubStage(stage.id)}
                          >
                            OK
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setNewItem(null)}
                          >
                            X
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell colSpan={5} />
                    </TableRow>
                  )}
                </>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteStep > 0} onOpenChange={() => setDeleteStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteStep === 1
                ? t('sched.delete_title')
                : t('sched.delete_confirm_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteStep === 1
                ? t('sched.delete_desc')
                : t('sched.delete_confirm_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteStep(0)}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteStep === 1 ? t('confirm') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Member Dialog */}
      <Dialog open={!!assignData} onOpenChange={() => setAssignData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sched.allocate_labor')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('sched.team_member')}</Label>
              <Select onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder={t('team.select_pro')} />
                </SelectTrigger>
                <SelectContent>
                  {teamMembersToSelect.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.partnerName} -{' '}
                      {t(`role.${member.role.toLowerCase()}`) || member.role})
                    </SelectItem>
                  ))}
                  {teamMembersToSelect.length === 0 && (
                    <div className="p-2 text-xs text-center text-muted-foreground">
                      {t('sched.no_member')}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {isPartnerView && (
                <p className="text-xs text-muted-foreground">
                  {t('sched.partner_only')}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>{t('sched.task_price')}</Label>
              <CurrencyInput
                value={taskPrice}
                onChange={(val) => setTaskPrice(val)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
