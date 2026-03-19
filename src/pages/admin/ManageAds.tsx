import { useState } from 'react'
import { useAdStore, Ad } from '@/stores/useAdStore'
import { useAdminPricingStore } from '@/stores/useAdminPricingStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { format, differenceInMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  MoreVertical,
  PauseCircle,
  XCircle,
  CalendarPlus,
  FileText,
  HardHat,
  Info,
} from 'lucide-react'

export default function ManageAds() {
  const { ads, updateAdStatus, extendAd } = useAdStore()
  const { plans } = useAdminPricingStore()
  const { formatCurrency } = useLanguageStore()
  const { toast } = useToast()

  const [extendDialog, setExtendDialog] = useState<{
    open: boolean
    adId: string
    newDate: string
  }>({ open: false, adId: '', newDate: '' })

  const getPlanDetails = (planName: string) =>
    plans.find((p) => p.name === planName)

  const calcBilling = (ad: Ad) => {
    const plan = getPlanDetails(ad.planLevel)
    if (!plan) return 0
    let months = differenceInMonths(ad.endDate, ad.startDate)
    if (months <= 0) months = 1
    return months * plan.price
  }

  const handleStatusChange = (id: string, status: Ad['status']) => {
    updateAdStatus(id, status)
    toast({
      title: 'Status Atualizado',
      description: `O anúncio foi marcado como ${status}.`,
    })
  }

  const handleExtend = () => {
    if (!extendDialog.newDate) return
    extendAd(extendDialog.adId, new Date(extendDialog.newDate))
    setExtendDialog({ open: false, adId: '', newDate: '' })
    toast({ title: 'Anúncio Estendido com Sucesso' })
  }

  const handleGenerateDoc = (ad: Ad) => {
    const docName = ad.country === 'BR' ? 'Nota Fiscal (NF)' : 'Billing Note'
    toast({
      title: `${docName} Gerada`,
      description: `Documento financeiro enviado para ${ad.advertiserName}.`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>
      case 'suspended':
        return <Badge className="bg-amber-500">Suspenso</Badge>
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestão de Publicidade
        </h1>
        <p className="text-muted-foreground">
          Gerencie o ciclo de vida, faturamento e documentação de anúncios.
        </p>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anunciante</TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead>Plano / Regras</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Faturamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => {
              const plan = getPlanDetails(ad.planLevel)
              return (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">
                    {ad.advertiserName}
                    <div className="text-xs text-muted-foreground">
                      {ad.country === 'BR' ? 'Brasil' : ad.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {ad.isConstruction && (
                        <HardHat className="h-4 w-4 text-orange-500" />
                      )}
                      <span>{ad.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="outline">{ad.planLevel}</Badge>
                      {plan && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" /> P:
                          {plan.priorityWeight || 1} | A:
                          {plan.earlyAccessHours || 0}h
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>Início: {format(ad.startDate, 'dd/MM/yyyy')}</div>
                    <div>Fim: {format(ad.endDate, 'dd/MM/yyyy')}</div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(calcBilling(ad))}
                  </TableCell>
                  <TableCell>{getStatusBadge(ad.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleGenerateDoc(ad)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Gerar {ad.country === 'BR' ? 'NF' : 'Billing Note'}
                        </DropdownMenuItem>
                        {ad.status === 'active' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(ad.id, 'suspended')
                            }
                          >
                            <PauseCircle className="mr-2 h-4 w-4" /> Suspender
                          </DropdownMenuItem>
                        )}
                        {(ad.status === 'active' ||
                          ad.status === 'suspended') && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleStatusChange(ad.id, 'canceled')
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            setExtendDialog({
                              open: true,
                              adId: ad.id,
                              newDate: '',
                            })
                          }
                        >
                          <CalendarPlus className="mr-2 h-4 w-4" /> Estender
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={extendDialog.open}
        onOpenChange={(val) => setExtendDialog((p) => ({ ...p, open: val }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estender Anúncio</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Nova Data de Expiração</Label>
              <Input
                type="date"
                value={extendDialog.newDate}
                onChange={(e) =>
                  setExtendDialog((p) => ({ ...p, newDate: e.target.value }))
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              O faturamento será recalculado automaticamente com base no período
              adicional e nas regras do plano ativo.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleExtend} disabled={!extendDialog.newDate}>
              Confirmar Extensão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
