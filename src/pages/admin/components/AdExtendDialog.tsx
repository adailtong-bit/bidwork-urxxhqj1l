import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdStore, Ad } from '@/stores/useAdStore'
import { useToast } from '@/hooks/use-toast'

export default function AdExtendDialog({
  ad,
  open,
  onOpenChange,
}: {
  ad: Ad
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [newDate, setNewDate] = useState('')
  const { extendAd } = useAdStore()
  const { toast } = useToast()

  const handleExtend = () => {
    if (!newDate) return
    extendAd(ad.id, new Date(newDate))
    onOpenChange(false)
    toast({
      title: 'Anúncio Estendido com Sucesso',
      description: 'O faturamento foi recalculado com base no novo período.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estender Anúncio</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Nova Data de Expiração</Label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            O faturamento será recalculado automaticamente com base no período
            adicional, nível do site e multiplicadores da matriz de preços.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleExtend} disabled={!newDate}>
            Confirmar Extensão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
