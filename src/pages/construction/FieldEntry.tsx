import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore, ProjectLedgerEntry } from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, CheckCircle2, ClipboardEdit } from 'lucide-react'

export default function FieldEntry() {
  const navigate = useNavigate()
  const { projects, updateLedgerEntry } = useProjectStore()
  const { toast } = useToast()

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<ProjectLedgerEntry | null>(
    null,
  )

  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [finalCost, setFinalCost] = useState<number>(0)
  const [notes, setNotes] = useState('')

  // Default to first project if none selected
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const project = projects.find((p) => p.id === selectedProjectId)

  // Show pending tasks that do not have an endDate
  const pendingTasks = project?.ledgerEntries?.filter((l) => !l.endDate) || []

  const handleOpenTask = (task: ProjectLedgerEntry) => {
    setSelectedTask(task)
    setEndDate(new Date().toISOString().split('T')[0])
    setFinalCost(task.estimatedCost || 0)
    setNotes('')
  }

  const handleSubmit = () => {
    if (!selectedTask || !project) return

    updateLedgerEntry(project.id, selectedTask.id, {
      endDate: new Date(endDate + 'T12:00:00'),
      finalCost: finalCost,
      executionStatus: 'in_review',
    })

    toast({
      title: 'Apontamento Registrado',
      description: 'A tarefa foi atualizada com sucesso no painel financeiro.',
    })

    setSelectedTask(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-20 animate-fade-in">
      <header className="bg-background border-b p-4 sticky top-0 z-30 flex items-center gap-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate(`/construction/projects/${selectedProjectId}`)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Apontamento de Campo</h1>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Selecionar Obra</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Tarefas Pendentes ({pendingTasks.length})
          </h2>

          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleOpenTask(task)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ClipboardEdit className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm leading-tight">
                        {task.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fornecedor:{' '}
                        {project?.partners.find((p) => p.id === task.partnerId)
                          ?.companyName || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground opacity-50 shrink-0" />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 bg-background rounded-lg border border-dashed">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">
                Tudo em dia! Nenhuma tarefa pendente.
              </p>
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={!!selectedTask}
        onOpenChange={(o) => !o && setSelectedTask(null)}
      >
        <DialogContent className="w-[95vw] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Finalizar Tarefa</DialogTitle>
            <DialogDescription>{selectedTask?.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Data de Término Real</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Custo Final (R$)</Label>
              <Input
                type="number"
                value={finalCost}
                onChange={(e) => setFinalCost(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Custo Previsto: R$ {selectedTask?.estimatedCost}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Observações (Opcional)</Label>
              <Input
                placeholder="Atrasos, problemas, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setSelectedTask(null)}
            >
              Cancelar
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSubmit}>
              Confirmar Término
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
