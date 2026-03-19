import { useState, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdStore } from '@/stores/useAdStore'
import { usePricingMatrixStore } from '@/stores/usePricingMatrixStore'
import { useToast } from '@/hooks/use-toast'
import { differenceInDays } from 'date-fns'

export default function AdCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { addAd } = useAdStore()
  const { rules, calculatePrice } = usePricingMatrixStore()
  const { toast } = useToast()

  const [form, setForm] = useState({
    advertiserName: '',
    title: '',
    category: 'Construction',
    region: 'BR',
    planLevel: 'Bronze',
    startDate: '',
    endDate: '',
  })

  const price = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0
    const days = differenceInDays(
      new Date(form.endDate),
      new Date(form.startDate),
    )
    if (days <= 0) return 0
    return calculatePrice(form.planLevel, form.region, form.category, days)
  }, [form, calculatePrice])

  const handleSubmit = () => {
    if (!form.advertiserName || !form.startDate || !form.endDate) return
    addAd({
      title: form.title || `Campanha ${form.advertiserName}`,
      advertiserName: form.advertiserName,
      category: form.category,
      region: form.region,
      country:
        form.region === 'BR' ? 'BR' : form.region === 'US' ? 'US' : 'Other',
      planLevel: form.planLevel,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      calculatedPrice: price,
      status: 'active',
      createdAt: new Date(),
      skillWeight:
        form.planLevel === 'Premium'
          ? 10
          : form.planLevel === 'Gold'
            ? 7
            : form.planLevel === 'Silver'
              ? 4
              : 1,
      views: 0,
      clicks: 0,
      likes: 0,
      dislikes: 0,
      active: true,
      segment: 'all',
      type: 'segmented',
      isConstruction: form.category === 'Construction',
      imageUrl: `https://img.usecurling.com/p/600/200?q=${form.category.toLowerCase()}`,
    })
    onOpenChange(false)
    toast({
      title: 'Anúncio Criado',
      description: `Faturamento inicial de R$ ${price.toFixed(2)}`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Anúncio</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Anunciante</Label>
            <Input
              value={form.advertiserName}
              onChange={(e) =>
                setForm((p) => ({ ...p, advertiserName: e.target.value }))
              }
              placeholder="Nome do Cliente"
            />
          </div>
          <div className="space-y-2">
            <Label>Título da Campanha</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Título do Ad"
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria (Branch)</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(rules.categoryMultipliers).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Região</Label>
            <Select
              value={form.region}
              onValueChange={(v) => setForm((p) => ({ ...p, region: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(rules.regionMultipliers).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nível do Site</Label>
            <Select
              value={form.planLevel}
              onValueChange={(v) => setForm((p) => ({ ...p, planLevel: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(rules.siteLevels).map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Custo Estimado</Label>
            <div className="h-10 px-3 py-2 border rounded-md bg-muted text-primary font-bold flex items-center">
              R$ {price.toFixed(2)}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, startDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Data de Fim</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, endDate: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!form.advertiserName || !form.startDate || !form.endDate}
          >
            Criar Anúncio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
