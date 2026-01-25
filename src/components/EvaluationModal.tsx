import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Star, Lock } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

interface EvaluationModalProps {
  open: boolean
}

export function EvaluationModal({ open }: EvaluationModalProps) {
  const { user, clearPendingEvaluation } = useAuthStore()
  const { toast } = useToast()
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')

  if (!user || !user.pendingEvaluation) return null

  const { targetName, type } = user.pendingEvaluation

  const criteria =
    type === 'contractor_to_executor'
      ? [
          'Pontualidade',
          'Execução',
          'Prazo',
          'Limpeza',
          'Atendimento',
          'Qualidade',
        ]
      : [
          'Clareza na Descrição',
          'Condições de Execução',
          'Atendimento',
          'Pontualidade',
          'Preço Oferecido',
        ]

  const handleScoreChange = (criterion: string, value: number[]) => {
    setScores((prev) => ({ ...prev, [criterion]: value[0] }))
  }

  const handleSubmit = () => {
    // Validation
    const allScored = criteria.every((c) => scores[c] !== undefined)
    if (!allScored) {
      toast({
        variant: 'destructive',
        title: 'Avaliação Incompleta',
        description: 'Por favor, avalie todos os critérios.',
      })
      return
    }

    // Submit logic mock
    toast({
      title: 'Avaliação Enviada',
      description: 'Obrigado pelo feedback! Sua conta foi desbloqueada.',
    })
    clearPendingEvaluation()
  }

  // Calculate average
  const currentScores = Object.values(scores)
  const average =
    currentScores.length > 0
      ? (
          currentScores.reduce((a, b) => a + b, 0) / currentScores.length
        ).toFixed(1)
      : '0.0'

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto bg-destructive/10 p-3 rounded-full mb-4">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">
            Avaliação Pendente Obrigatória
          </DialogTitle>
          <DialogDescription className="text-center">
            Para continuar utilizando o BIDWORK, você deve avaliar seu último
            serviço com <b>{targetName}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto px-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-primary">{average}</span>
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${Number(average) / 2 >= i ? 'fill-current' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {criteria.map((criterion) => (
              <div key={criterion} className="space-y-3">
                <div className="flex justify-between">
                  <Label>{criterion}</Label>
                  <span className="font-bold text-primary">
                    {scores[criterion] ?? '-'}
                  </span>
                </div>
                <Slider
                  defaultValue={[0]}
                  max={10}
                  step={1}
                  onValueChange={(val) => handleScoreChange(criterion, val)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Ruim (0)</span>
                  <span>Excelente (10)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Comentários Adicionais</Label>
            <Textarea
              placeholder="Descreva sua experiência detalhadamente..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={handleSubmit} size="lg">
            Enviar Avaliação e Desbloquear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
