import { useState } from 'react'
import { useProjectStore, DailyLog } from '@/stores/useProjectStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Users,
  Truck,
  Camera,
  Plus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ProjectDailyLogs({ projectId }: { projectId: string }) {
  const { getProject, addDailyLog } = useProjectStore()
  const project = getProject(projectId)
  const { formatDate } = useLanguageStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weather: 'sunny' as DailyLog['weather'],
    teamSize: '',
    equipment: '',
    occurrences: '',
  })

  if (!project) return null

  const handleSubmit = () => {
    if (!formData.date || !formData.teamSize || !formData.occurrences) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }

    addDailyLog(projectId, {
      date: new Date(formData.date),
      weather: formData.weather,
      teamSize: Number(formData.teamSize),
      equipment: formData.equipment,
      occurrences: formData.occurrences,
      photos: ['https://img.usecurling.com/p/400/300?q=construction%20site'], // Mock
    })

    setOpen(false)
    toast({ title: 'Diário de Obra Registrado' })
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weather: 'sunny',
      teamSize: '',
      equipment: '',
      occurrences: '',
    })
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-yellow-500" />
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-500" />
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-500" />
      case 'snow':
        return <Snowflake className="h-5 w-5 text-sky-300" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  const sortedLogs = [...project.dailyLogs].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  )

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Diário de Obra</CardTitle>
          <CardDescription>
            Registro diário de clima, efetivo e ocorrências.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Registro no Diário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Clima</Label>
                  <Select
                    value={formData.weather}
                    onValueChange={(val: any) =>
                      setFormData({ ...formData, weather: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny">Ensolarado</SelectItem>
                      <SelectItem value="cloudy">Nublado</SelectItem>
                      <SelectItem value="rainy">Chuvoso</SelectItem>
                      <SelectItem value="snow">Neve/Frio Extremo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Efetivo (Nº Trabalhadores)</Label>
                  <Input
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) =>
                      setFormData({ ...formData, teamSize: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Equipamentos no Canteiro</Label>
                  <Input
                    placeholder="Ex: Betoneira..."
                    value={formData.equipment}
                    onChange={(e) =>
                      setFormData({ ...formData, equipment: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ocorrências / Atividades do Dia</Label>
                <Textarea
                  className="min-h-[100px]"
                  value={formData.occurrences}
                  onChange={(e) =>
                    setFormData({ ...formData, occurrences: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>Salvar Registro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sortedLogs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
            Nenhum registro no diário de obra ainda.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-5 bg-card shadow-sm"
              >
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
                      <span className="text-xs text-muted-foreground uppercase">
                        {formatDate(log.date, 'MMM')}
                      </span>
                      <span className="text-2xl font-bold">
                        {formatDate(log.date, 'dd')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {formatDate(log.date, 'EEEE')}
                      </h4>
                      <div className="flex gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          {getWeatherIcon(log.weather)} {log.weather}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          <Users className="h-4 w-4" /> {log.teamSize} op.
                        </span>
                        {log.equipment && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                            <Truck className="h-4 w-4" /> {log.equipment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold mb-1">Ocorrências:</h5>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {log.occurrences}
                    </p>
                  </div>
                  {log.photos && log.photos.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Camera className="h-4 w-4" /> Anexos Visuais:
                      </h5>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {log.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt="Evidência"
                            className="h-24 w-32 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
