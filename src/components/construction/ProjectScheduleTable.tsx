import { useState, Fragment } from 'react'
import {
  Stage,
  SubStage,
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
  DollarSign,
  UserPlus,
  CheckCircle2,
} from 'lucide-react'
import { format } from 'date-fns'
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
  const [taskPrice, setTaskPrice] = useState('')

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
        taskPrice: Number(taskPrice),
      })
      setAssignData(null)
      setSelectedMember('')
      setTaskPrice('')
    }
  }

  const safeStages = Array.isArray(stages) ? stages : []

  // Filter team members based on view context
  // If Partner View, show ONLY partner's team (assuming first partner for demo or passed via props)
  // For demo, we use the first partner in list if isPartnerView is true, else all
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
            <TableHead className="w-[300px]">Tarefa / Etapa (WBS)</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead className="w-[180px]">Progresso</TableHead>
            <TableHead>Status</TableHead>
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
                      {stage.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{format(stage.startDate, 'dd/MM/yy')}</TableCell>
                <TableCell>{format(stage.endDate, 'dd/MM/yy')}</TableCell>
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
                  <Badge variant="outline">{stage.status}</Badge>
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
                        Adicionar Atividade
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
                            {sub.name}
                          </span>
                          {sub.assignedTeamMemberId && (
                            <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                              <UserPlus className="h-3 w-3" />
                              {partners
                                .flatMap((p) => p.team)
                                .find((m) => m.id === sub.assignedTeamMemberId)
                                ?.name || 'Membro da Equipe'}
                              {sub.taskPrice && ` • R$ ${sub.taskPrice}`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {format(sub.startDate, 'dd/MM/yy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {format(sub.endDate, 'dd/MM/yy')}
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
                          {sub.status}
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
                            {isPartnerView && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setAssignData({
                                    stageId: stage.id,
                                    subStageId: sub.id,
                                  })
                                }
                              >
                                <UserPlus className="mr-2 h-4 w-4" /> Alocar
                                Equipe
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(stage.id, sub.id)
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {sub.status === 'completed'
                                ? 'Reabrir'
                                : 'Concluir'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleDelay(stage.id, sub.id, sub.status)
                              }
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              {sub.status === 'delayed'
                                ? 'Remover Atraso'
                                : 'Marcar Atraso'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleDeleteClick(stage.id, sub.id)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Remover
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
                            placeholder="Nome da nova atividade..."
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
              {deleteStep === 1 ? 'Excluir Atividade?' : 'Confirmação Final'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteStep === 1
                ? 'Esta ação removerá a atividade do cronograma. Clique em continuar para prosseguir.'
                : 'Tem certeza absoluta? Esta ação não pode ser desfeita e todos os dados vinculados serão perdidos.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteStep(0)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteStep === 1 ? 'Continuar' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Member Dialog */}
      <Dialog open={!!assignData} onOpenChange={() => setAssignData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alocar Mão de Obra</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Membro da Equipe (Filtrado)</Label>
              <Select onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembersToSelect.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                  {teamMembersToSelect.length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhum membro disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {isPartnerView && (
                <p className="text-xs text-muted-foreground">
                  Apenas membros da sua equipe são exibidos.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Preço da Tarefa (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="number"
                  value={taskPrice}
                  onChange={(e) => setTaskPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign}>Salvar Alocação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
