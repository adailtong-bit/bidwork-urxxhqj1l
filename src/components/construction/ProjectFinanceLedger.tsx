import { useState } from 'react'
import { useProjectStore, ProjectLedgerEntry } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CurrencyInput } from '@/components/CurrencyInput'
import { AlertTriangle, Trash2, Plus, Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProjectFinanceLedger({ projectId }: { projectId: string }) {
  const { getProject, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry } =
    useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const { toast } = useToast()
  const project = getProject(projectId)

  const [isLedgerOpen, setIsLedgerOpen] = useState(false)
  const [editingLedger, setEditingLedger] = useState<ProjectLedgerEntry | null>(
    null,
  )
  const [ledgerForm, setLedgerForm] = useState<Partial<ProjectLedgerEntry>>({
    description: '',
    origin: '',
    partnerId: '',
    estimatedCost: 0,
    finalCost: 0,
    paymentStatus: 'pending',
    executionStatus: 'pending',
  })
  const [dates, setDates] = useState({
    purchaseDate: '',
    deliveryDate: '',
    startDate: '',
    endDate: '',
  })

  if (!project) return null

  const ledgerEntries = project.ledgerEntries || []
  const estLedger = ledgerEntries.reduce((a, b) => a + b.estimatedCost, 0)
  const actLedger = ledgerEntries.reduce((a, b) => a + b.finalCost, 0)

  const getPartnerCompliance = (partnerId: string) => {
    const docs = project.complianceDocuments || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return docs.filter(
      (d) =>
        (d.partnerId === partnerId || d.partnerId === 'general') &&
        d.isCritical &&
        new Date(d.expirationDate) < today,
    )
  }

  const handleExportCSV = () => {
    const headers = [
      'Serviço',
      'Origem',
      'Fornecedor',
      'Data Compra',
      'Data Entrega',
      'Início Execução',
      'Término Execução',
      'Custo Previsto',
      'Custo Final',
      'Status Pagamento',
      'Status Risco',
    ]

    const csvRows = ledgerEntries.map((l) => {
      const partnerName =
        project.partners.find((p) => p.id === l.partnerId)?.companyName || 'N/A'
      const expiredDocs = getPartnerCompliance(l.partnerId)
      const isBlocked = expiredDocs.length > 0

      return [
        `"${l.description}"`,
        `"${l.origin || ''}"`,
        `"${partnerName}"`,
        l.purchaseDate
          ? formatDate(new Date(l.purchaseDate), 'dd/MM/yyyy')
          : '',
        l.deliveryDate
          ? formatDate(new Date(l.deliveryDate), 'dd/MM/yyyy')
          : '',
        l.startDate ? formatDate(new Date(l.startDate), 'dd/MM/yyyy') : '',
        l.endDate ? formatDate(new Date(l.endDate), 'dd/MM/yyyy') : '',
        l.estimatedCost,
        l.finalCost,
        l.paymentStatus,
        isBlocked ? 'Bloqueado' : 'Regular',
      ].join(',')
    })

    const csvContent = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `ledger_export_${projectId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({ title: 'Exportação CSV concluída!' })
  }

  const handleExportPDF = () => {
    toast({
      title: 'Preparando PDF...',
      description: 'A janela de impressão será aberta.',
    })
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleOpenLedger = (entry?: ProjectLedgerEntry) => {
    if (entry) {
      setEditingLedger(entry)
      setLedgerForm(entry)
      setDates({
        purchaseDate: entry.purchaseDate
          ? new Date(entry.purchaseDate).toISOString().split('T')[0]
          : '',
        deliveryDate: entry.deliveryDate
          ? new Date(entry.deliveryDate).toISOString().split('T')[0]
          : '',
        startDate: entry.startDate
          ? new Date(entry.startDate).toISOString().split('T')[0]
          : '',
        endDate: entry.endDate
          ? new Date(entry.endDate).toISOString().split('T')[0]
          : '',
      })
    } else {
      setEditingLedger(null)
      setLedgerForm({
        description: '',
        origin: '',
        partnerId: '',
        estimatedCost: 0,
        finalCost: 0,
        paymentStatus: 'pending',
        executionStatus: 'pending',
      })
      setDates({
        purchaseDate: '',
        deliveryDate: '',
        startDate: '',
        endDate: '',
      })
    }
    setIsLedgerOpen(true)
  }

  const handleSaveLedger = () => {
    const payload = {
      ...ledgerForm,
      purchaseDate: dates.purchaseDate
        ? new Date(dates.purchaseDate + 'T12:00:00')
        : undefined,
      deliveryDate: dates.deliveryDate
        ? new Date(dates.deliveryDate + 'T12:00:00')
        : undefined,
      startDate: dates.startDate
        ? new Date(dates.startDate + 'T12:00:00')
        : undefined,
      endDate: dates.endDate
        ? new Date(dates.endDate + 'T12:00:00')
        : undefined,
    } as Omit<ProjectLedgerEntry, 'id'>

    if (editingLedger) {
      updateLedgerEntry(projectId, editingLedger.id, payload)
      toast({ title: 'Registro financeiro atualizado.' })
    } else {
      addLedgerEntry(projectId, payload)
      toast({ title: 'Registro financeiro adicionado.' })
    }
    setIsLedgerOpen(false)
  }

  return (
    <div className="flex flex-col space-y-4 w-full animate-fade-in">
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">Diário de Execução (Ledger)</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os custos e cronograma de fornecedores.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-muted/20 p-2 rounded-lg border w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Previsto</p>
              <p className="font-bold">{formatCurrency(estLedger)}</p>
            </div>
            <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
            <div className="text-right mr-4">
              <p className="text-xs text-muted-foreground">Total Final</p>
              <p className="font-bold text-primary">
                {formatCurrency(actLedger)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button onClick={() => handleOpenLedger()} size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />{' '}
              <span className="hidden sm:inline">Novo Registro</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-auto w-full max-h-[600px]">
          <Table className="min-w-[1200px] w-full relative">
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Descrição do Serviço</TableHead>
                <TableHead>Origin / Fornecedor</TableHead>
                <TableHead>Data Compra</TableHead>
                <TableHead>Data Entrega</TableHead>
                <TableHead>Início Execução</TableHead>
                <TableHead>Término Execução</TableHead>
                <TableHead className="text-right">Custo Previsto</TableHead>
                <TableHead className="text-right">Custo Final</TableHead>
                <TableHead className="text-center">Status Risco</TableHead>
                <TableHead className="text-center">Pagamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.length > 0 ? (
                ledgerEntries.map((l) => {
                  const expiredDocs = getPartnerCompliance(l.partnerId)
                  const isBlocked = expiredDocs.length > 0
                  const partnerName =
                    project.partners.find((p) => p.id === l.partnerId)
                      ?.companyName || 'N/A'

                  return (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleOpenLedger(l)}
                    >
                      <TableCell className="font-medium">
                        {l.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{l.origin || '-'}</span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {partnerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {l.purchaseDate
                          ? formatDate(new Date(l.purchaseDate), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {l.deliveryDate
                          ? formatDate(new Date(l.deliveryDate), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {l.startDate
                          ? formatDate(new Date(l.startDate), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {l.endDate ? (
                          formatDate(new Date(l.endDate), 'dd/MM/yyyy')
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] whitespace-nowrap bg-muted/50 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateLedgerEntry(projectId, l.id, {
                                endDate: new Date(),
                              })
                              toast({
                                title:
                                  'Data de término registrada (Site Entry)!',
                              })
                            }}
                          >
                            Marcar Término
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs line-through">
                        {formatCurrency(l.estimatedCost)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(l.finalCost)}
                      </TableCell>
                      <TableCell className="text-center">
                        {isBlocked ? (
                          <Badge
                            variant="destructive"
                            title={expiredDocs.map((d) => d.name).join(', ')}
                            className="whitespace-nowrap"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" /> Bloqueado
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            Regular
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isBlocked ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex w-[120px] mx-auto">
                                  <Select disabled value={l.paymentStatus}>
                                    <SelectTrigger className="h-8 border-red-200 bg-red-50 text-red-800 text-[11px] w-full cursor-not-allowed">
                                      <SelectValue placeholder="Bloqueado" />
                                    </SelectTrigger>
                                  </Select>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-red-50 text-red-900 border-red-200">
                                Docs vencidos:{' '}
                                {expiredDocs.map((d) => d.name).join(', ')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Select
                            value={l.paymentStatus}
                            onValueChange={(val) =>
                              updateLedgerEntry(projectId, l.id, {
                                paymentStatus: val as any,
                              })
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                'h-8 border text-[11px] w-[120px] mx-auto',
                                l.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : l.paymentStatus === 'overdue'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : l.paymentStatus === 'partially_paid'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-secondary',
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="partially_paid">
                                Parcialmente Pago
                              </SelectItem>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="overdue">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteLedgerEntry(projectId, l.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-12 text-muted-foreground italic"
                  >
                    Nenhum registro no Ledger.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={isLedgerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLedger(null)
            setLedgerForm({
              description: '',
              origin: '',
              partnerId: '',
              estimatedCost: 0,
              finalCost: 0,
              paymentStatus: 'pending',
              executionStatus: 'pending',
            })
            setDates({
              purchaseDate: '',
              deliveryDate: '',
              startDate: '',
              endDate: '',
            })
          }
          setIsLedgerOpen(open)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLedger
                ? 'Editar Registro Financeiro'
                : 'Novo Registro Financeiro'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={ledgerForm.description}
                  onChange={(e) =>
                    setLedgerForm({
                      ...ledgerForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Ex: Instalação Hidráulica"
                />
              </div>
              <div className="space-y-2">
                <Label>Origem do Pedido</Label>
                <Input
                  value={ledgerForm.origin}
                  placeholder="Ex: Contrato X, Pedido Y"
                  onChange={(e) =>
                    setLedgerForm({ ...ledgerForm, origin: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Empresa Fornecedora <span className="text-red-500">*</span>
              </Label>
              <Select
                value={ledgerForm.partnerId}
                onValueChange={(val) =>
                  setLedgerForm({ ...ledgerForm, partnerId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {project.partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Compra</Label>
                <Input
                  type="date"
                  value={dates.purchaseDate}
                  onChange={(e) =>
                    setDates({ ...dates, purchaseDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Entrega</Label>
                <Input
                  type="date"
                  value={dates.deliveryDate}
                  onChange={(e) =>
                    setDates({ ...dates, deliveryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início Execução</Label>
                <Input
                  type="date"
                  value={dates.startDate}
                  onChange={(e) =>
                    setDates({ ...dates, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data Término Execução</Label>
                <Input
                  type="date"
                  value={dates.endDate}
                  onChange={(e) =>
                    setDates({ ...dates, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Custo Previsto</Label>
                <CurrencyInput
                  value={ledgerForm.estimatedCost || 0}
                  onChange={(val) =>
                    setLedgerForm({ ...ledgerForm, estimatedCost: val })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Final</Label>
                <CurrencyInput
                  value={ledgerForm.finalCost || 0}
                  onChange={(val) =>
                    setLedgerForm({ ...ledgerForm, finalCost: val })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status Pagamento</Label>
                <Select
                  value={ledgerForm.paymentStatus}
                  onValueChange={(val) =>
                    setLedgerForm({
                      ...ledgerForm,
                      paymentStatus: val as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="partially_paid">Parcial</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!ledgerForm.description || !ledgerForm.partnerId}
              onClick={handleSaveLedger}
            >
              Salvar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
