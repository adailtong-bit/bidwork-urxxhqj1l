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
import { Star, Lock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface EvaluationModalProps {
  open: boolean
}

export function EvaluationModal({ open }: EvaluationModalProps) {
  const { user, clearPendingEvaluation } = useAuthStore()
  const { toast } = useToast()
  const [scores, setScores] = useState<Record<string, number>>({})
  const [priceRating, setPriceRating] = useState<string>('2')
  const [comment, setComment] = useState('')

  if (!user || !user.pendingEvaluation) return null

  const { targetName, type } = user.pendingEvaluation

  const isContractorToExecutor = type === 'contractor_to_executor'

  // Categories based on User Story
  const criteria = isContractorToExecutor
    ? [
        { key: 'punctuality', label: 'Pontualidade' },
        { key: 'execution', label: 'Execução Técnica' },
        { key: 'executionTime', label: 'Prazo de Execução' },
        { key: 'cleaning', label: 'Limpeza Pós-Obra' },
        { key: 'service', label: 'Atendimento' },
        { key: 'quality', label: 'Qualidade Geral' },
      ]
    : [
        { key: 'jobDescription', label: 'Clareza na Descrição' },
        { key: 'conditions', label: 'Condições de Execução' },
        { key: 'service', label: 'Atendimento' },
        { key: 'punctuality', label: 'Pontualidade no Pagamento' },
      ]

  const handleScoreChange = (key: string, value: number[]) => {
    setScores((prev) => ({ ...prev, [key]: value[0] }))
  }

  const handleSubmit = () => {
    // Validation
    const allScored = criteria.every((c) => scores[c.key] !== undefined)
    if (!allScored) {
      toast({
        variant: 'destructive',
        title: 'Avaliação Incompleta',
        description: 'Por favor, avalie todos os critérios obrigatórios.',
      })
      return
    }

    if (comment.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Comentário muito curto',
        description: 'Por favor, detalhe sua experiência.',
      })
      return
    }

    // Submit logic mock
    console.log('Submitted Evaluation:', {
      scores,
      priceRating: !isContractorToExecutor ? priceRating : undefined,
      comment,
    })

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
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">
            Avaliação Obrigatória Pendente
          </DialogTitle>
          <DialogDescription className="text-center">
            Para desbloquear todas as funcionalidades do BIDWORK, você deve
            avaliar o serviço realizado com <b>{targetName}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto px-2">
          <div className="flex flex-col items-center justify-center gap-2 bg-muted/30 p-4 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">
              Média Geral
            </span>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-bold text-primary">{average}</span>
              <div className="flex text-yellow-500">
                <Star className="h-8 w-8 fill-current" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {criteria.map((item) => (
              <div key={item.key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base">{item.label}</Label>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {scores[item.key] ?? '-'} / 10
                  </span>
                </div>
                <Slider
                  defaultValue={[0]}
                  max={10}
                  step={1}
                  onValueChange={(val) => handleScoreChange(item.key, val)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Ruim (0)</span>
                  <span>Excelente (10)</span>
                </div>
              </div>
            ))}

            {!isContractorToExecutor && (
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-base">Preço Oferecido</Label>
                <RadioGroup
                  value={priceRating}
                  onValueChange={setPriceRating}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="p1" />
                    <Label htmlFor="p1">Abaixo da Média (Ruim)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="p2" />
                    <Label htmlFor="p2">Na Média (Justo)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="p3" />
                    <Label htmlFor="p3">Acima da Média (Ótimo)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Comentários Detalhados</Label>
            <Textarea
              placeholder="Descreva sua experiência, pontos positivos e negativos..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 10 caracteres.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleSubmit}
            size="lg"
          >
            Enviar Avaliação e Desbloquear Acesso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
