import { useState, Fragment } from 'react'
import { Stage, SubStage, useProjectStore } from '@/stores/useProjectStore'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ProjectScheduleTableProps {
  projectId: string
  stages: Stage[]
}

export function ProjectScheduleTable({
  projectId,
  stages = [],
}: ProjectScheduleTableProps) {
  const { updateStage, updateSubStage, addSubStage } = useProjectStore()
  // Ensure stages is an array before using map for initial state
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set((stages || []).map((s) => s.id)),
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<{
    parentId: string
    name: string
  } | null>(null)

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
    if (subStageId) {
      updateSubStage(projectId, stageId, subStageId, {
        progress: clamped,
        status:
          clamped === 100
            ? 'completed'
            : clamped > 0
              ? 'in_progress'
              : 'pending',
      })
    } else {
      updateStage(projectId, stageId, {
        progress: clamped,
        status:
          clamped === 100
            ? 'completed'
            : clamped > 0
              ? 'in_progress'
              : 'pending',
      })
    }
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

  // Defensive check for stages prop
  const safeStages = Array.isArray(stages) ? stages : []

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
              <TableRow className="hover:bg-muted/30">
                <TableCell className="font-medium">
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
                <TableCell>
                  <Input
                    type="date"
                    className="h-8 w-32"
                    value={
                      stage.startDate
                        ? format(stage.startDate, 'yyyy-MM-dd')
                        : ''
                    }
                    onChange={(e) => {
                      const date = e.target.valueAsDate
                      if (date)
                        updateStage(projectId, stage.id, { startDate: date })
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    className="h-8 w-32"
                    value={
                      stage.endDate ? format(stage.endDate, 'yyyy-MM-dd') : ''
                    }
                    onChange={(e) => {
                      const date = e.target.valueAsDate
                      if (date)
                        updateStage(projectId, stage.id, { endDate: date })
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={stage.progress}
                      className={cn(
                        'h-2 flex-1',
                        stage.status === 'delayed' ? 'bg-red-100' : '',
                      )}
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="h-8 w-16 text-right"
                      value={stage.progress}
                      onChange={(e) =>
                        handleUpdateProgress(
                          stage.id,
                          null,
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      stage.status === 'delayed'
                        ? 'destructive'
                        : stage.status === 'completed'
                          ? 'default'
                          : 'secondary'
                    }
                    className={cn(
                      stage.status === 'completed' &&
                        'bg-green-600 hover:bg-green-700',
                    )}
                  >
                    {stage.status === 'delayed'
                      ? 'Atrasado'
                      : stage.status === 'completed'
                        ? 'Concluído'
                        : stage.status === 'in_progress'
                          ? 'Em Andamento'
                          : 'Pendente'}
                  </Badge>
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
                          handleToggleDelay(stage.id, null, stage.status)
                        }
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        {stage.status === 'delayed'
                          ? 'Remover Atraso'
                          : 'Marcar Atraso'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setNewItem({ parentId: stage.id, name: '' })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Sub-etapa
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
                      className="bg-muted/10 hover:bg-muted/20"
                    >
                      <TableCell className="pl-12">
                        <div className="flex items-center gap-2 border-l-2 border-muted pl-3">
                          <span className="truncate text-sm" title={sub.name}>
                            {sub.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          className="h-7 w-32 text-xs"
                          value={
                            sub.startDate
                              ? format(sub.startDate, 'yyyy-MM-dd')
                              : ''
                          }
                          onChange={(e) => {
                            const date = e.target.valueAsDate
                            if (date)
                              updateSubStage(projectId, stage.id, sub.id, {
                                startDate: date,
                              })
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          className="h-7 w-32 text-xs"
                          value={
                            sub.endDate ? format(sub.endDate, 'yyyy-MM-dd') : ''
                          }
                          onChange={(e) => {
                            const date = e.target.valueAsDate
                            if (date)
                              updateSubStage(projectId, stage.id, sub.id, {
                                endDate: date,
                              })
                          }}
                        />
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
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] h-5',
                            sub.status === 'delayed'
                              ? 'text-red-600 border-red-200 bg-red-50'
                              : sub.status === 'completed'
                                ? 'text-green-600 border-green-200 bg-green-50'
                                : '',
                          )}
                        >
                          {sub.status === 'delayed'
                            ? 'Atrasado'
                            : sub.status === 'completed'
                              ? 'Concluído'
                              : sub.status === 'in_progress'
                                ? 'Andamento'
                                : 'Pendente'}
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
                                handleToggleDelay(stage.id, sub.id, sub.status)
                              }
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              {sub.status === 'delayed'
                                ? 'Remover Atraso'
                                : 'Marcar Atraso'}
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
                            placeholder="Nome da sub-etapa..."
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
    </div>
  )
}
