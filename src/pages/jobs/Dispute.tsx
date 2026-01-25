import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { useDisputeStore } from '@/stores/useDisputeStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Upload, AlertTriangle } from 'lucide-react'

export default function Dispute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getJob } = useJobStore()
  const { createDispute } = useDisputeStore()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const job = getJob(id!)

  if (!job || !user) return null

  const handleSubmit = () => {
    if (!description) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Descreva o problema.',
      })
      return
    }
    createDispute(job.id, user.id, description, files)
    toast({
      title: 'Disputa Aberta',
      description: 'Nossa equipe de mediação analisará as evidências.',
    })
    navigate(`/jobs/${job.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Central de Disputas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abrir Reclamação: {job.title}</CardTitle>
          <CardDescription>
            Use este canal para resolver conflitos de execução ou pagamento.
            Forneça o máximo de detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Relato dos Fatos</label>
            <Textarea
              className="min-h-[150px]"
              placeholder="Descreva o que aconteceu, o que foi combinado e onde houve a falha..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Evidências (Fotos/Documentos)
            </label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique para adicionar arquivos
              </p>
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) =>
                  e.target.files && setFiles(Array.from(e.target.files))
                }
              />
            </div>
            {files.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                {files.length} arquivos selecionados
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleSubmit}>
              Iniciar Mediação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
