import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'

interface PremiumConstructionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PremiumConstructionModal({
  open,
  onOpenChange,
}: PremiumConstructionModalProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <DialogHeader>
          <div className="mx-auto bg-amber-100 p-4 rounded-full mb-4 w-fit">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Recurso Premium
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            O módulo de Gestão de Obras permite vincular serviços a etapas,
            gerenciar custos, materiais e equipes. Escolha um plano adequado ao
            tamanho da sua obra para desbloquear este recurso.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
          <Button
            className="w-full h-12 text-lg"
            onClick={() => {
              onOpenChange(false)
              navigate('/construction/plans')
            }}
          >
            Ver Planos de Gestão
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Agora não
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
