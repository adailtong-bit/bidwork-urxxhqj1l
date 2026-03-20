import { useState } from 'react'
import {
  useProjectStore,
  QuoteItem,
  ProjectInvoice,
} from '@/stores/useProjectStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CurrencyInput } from '@/components/CurrencyInput'
import {
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  FileSignature,
  Trash2,
  Receipt,
} from 'lucide-react'

export function ProjectQuotes({ projectId }: { projectId: string }) {
  const {
    getProject,
    addQuote,
    updateQuoteStatus,
    generateInvoiceFromQuote,
    updateQuoteContract,
  } = useProjectStore()
  const { toast } = useToast()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const project = getProject(projectId)

  // Add Quote State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [partnerId, setPartnerId] = useState('')
  const [stageId, setStageId] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([])
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemAmount, setNewItemAmount] = useState(0)

  if (!project) return null

  const handleAddItem = () => {
    if (!newItemDesc || newItemAmount <= 0) return
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        description: newItemDesc,
        amount: newItemAmount,
      },
    ])
    setNewItemDesc('')
    setNewItemAmount(0)
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const handleAddQuote = () => {
    if (!partnerId || !stageId || items.length === 0) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos.' })
      return
    }
    const totalAmount = items.reduce((acc, i) => acc + i.amount, 0)
    addQuote(projectId, {
      partnerId,
      stageId,
      items,
      totalAmount,
    })
    setIsAddOpen(false)
    setPartnerId('')
    setStageId('')
    setItems([])
    toast({ title: 'Orçamento enviado com sucesso!' })
  }

  const handleGenerateInvoice = (quoteId: string) => {
    generateInvoiceFromQuote(projectId, quoteId)
    toast({
      title: 'Fatura Gerada',
      description: 'Custo adicionado automaticamente no Financeiro.',
    })
  }

  const handleGenerateContract = (quoteId: string) => {
    updateQuoteContract(projectId, quoteId, 'https://example.com/contract.pdf')
    toast({
      title: 'Contrato Gerado',
      description: 'Termo associado ao orçamento com sucesso.',
    })
  }

  const getPartnerName = (id: string) =>
    project.partners.find((p) => p.id === id)?.companyName || 'Desconhecido'
  const getStageName = (id: string) =>
    project.stages.find((s) => s.id === id)?.name || 'Geral'

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Orçamentos de Parceiros</CardTitle>
            <CardDescription>
              Aprovação de propostas para fases específicas.
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enviar Orçamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Parceiro</Label>
                    <Select value={partnerId} onValueChange={setPartnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parceiro" />
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
                  <div className="grid gap-2">
                    <Label>Fase Relacionada</Label>
                    <Select value={stageId} onValueChange={setStageId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fase" />
                      </SelectTrigger>
                      <SelectContent>
                        {project.stages.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-4 bg-muted/20">
                  <Label>Itens do Orçamento</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Descrição do serviço/material"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <CurrencyInput
                        value={newItemAmount}
                        onChange={setNewItemAmount}
                      />
                    </div>
                    <Button onClick={handleAddItem} variant="secondary">
                      Adicionar
                    </Button>
                  </div>

                  {items.length > 0 && (
                    <ul className="space-y-2 pt-2 border-t">
                      {items.map((it) => (
                        <li
                          key={it.id}
                          className="flex justify-between items-center text-sm bg-background p-2 rounded border"
                        >
                          <span>{it.description}</span>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">
                              {formatCurrency(it.amount)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleRemoveItem(it.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="text-right pt-2 font-bold text-lg">
                    Total:{' '}
                    {formatCurrency(items.reduce((a, b) => a + b.amount, 0))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddQuote} disabled={items.length === 0}>
                  Salvar Orçamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Fase (Pacote)</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.quotes && project.quotes.length > 0 ? (
                  project.quotes.map((quote) => {
                    const isInvoiceGenerated = project.invoices?.some(
                      (i) => i.quoteId === quote.id,
                    )
                    return (
                      <TableRow key={quote.id}>
                        <TableCell>
                          {formatDate(quote.createdAt, 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getPartnerName(quote.partnerId)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {getStageName(quote.stageId)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(quote.totalAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              quote.status === 'approved'
                                ? 'default'
                                : quote.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={
                              quote.status === 'approved'
                                ? 'bg-green-500 hover:bg-green-600'
                                : ''
                            }
                          >
                            {quote.status === 'pending' && 'Pendente'}
                            {quote.status === 'approved' && 'Aprovado'}
                            {quote.status === 'rejected' && 'Rejeitado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {quote.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    updateQuoteStatus(
                                      project.id,
                                      quote.id,
                                      'approved',
                                    )
                                  }
                                  title="Aprovar"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    updateQuoteStatus(
                                      project.id,
                                      quote.id,
                                      'rejected',
                                    )
                                  }
                                  title="Rejeitar"
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            {quote.status === 'approved' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleGenerateContract(quote.id)
                                  }
                                  title="Gerar Contrato Básico"
                                  disabled={!!quote.contractUrl}
                                >
                                  <FileSignature
                                    className={`h-4 w-4 ${quote.contractUrl ? 'text-green-500' : 'text-blue-500'}`}
                                  />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleGenerateInvoice(quote.id)
                                  }
                                  title="Gerar Fatura e Alocar Custo"
                                  disabled={isInvoiceGenerated}
                                >
                                  <Receipt
                                    className={`h-4 w-4 ${isInvoiceGenerated ? 'text-green-500' : 'text-purple-500'}`}
                                  />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhum orçamento cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faturas e Contratos Gerados</CardTitle>
          <CardDescription>
            Documentos emitidos com base nos orçamentos aprovados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.invoices && project.invoices.length > 0 ? (
                  project.invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        {formatDate(inv.date, 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {inv.description}
                      </TableCell>
                      <TableCell>{inv.partnerName}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhuma fatura gerada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
