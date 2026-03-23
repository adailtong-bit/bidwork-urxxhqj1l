import { useState } from 'react'
import { useProjectStore, ComplianceDocument } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
  Settings,
  FileText,
  History,
  RefreshCw,
} from 'lucide-react'

interface ProjectComplianceProps {
  projectId: string
}

export function ProjectCompliance({ projectId }: ProjectComplianceProps) {
  const {
    getProject,
    addComplianceDocument,
    deleteComplianceDocument,
    updateAlertLeadTime,
    renewComplianceDocument,
  } = useProjectStore()
  const { t, formatDate } = useLanguageStore()
  const { toast } = useToast()

  const project = getProject(projectId)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [leadTime, setLeadTime] = useState(project?.alertLeadTimeDays || 30)

  const [newDoc, setNewDoc] = useState<Partial<ComplianceDocument>>({
    name: '',
    type: 'permit',
    partnerId: 'general',
    isCritical: false,
  })

  // Renew state
  const [isRenewOpen, setIsRenewOpen] = useState(false)
  const [docToRenew, setDocToRenew] = useState<ComplianceDocument | null>(null)
  const [renewData, setRenewData] = useState({
    expirationDate: '',
    issueDate: '',
    url: '',
  })

  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [docHistory, setDocHistory] = useState<ComplianceDocument | null>(null)

  if (!project) return null

  const leadTimeDays = project.alertLeadTimeDays || 30
  const docs = project.complianceDocuments || []
  const partners = project.partners || []

  const getDocStatus = (expirationDate: Date) => {
    const today = new Date()
    const exp = new Date(expirationDate)
    const diffTime = exp.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'expired'
    if (diffDays <= leadTimeDays) return 'expiring_soon'
    return 'valid'
  }

  const handleAddDoc = () => {
    if (!newDoc.name || !newDoc.expirationDate) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }

    addComplianceDocument(projectId, {
      name: newDoc.name,
      type: newDoc.type as any,
      provider: newDoc.provider,
      partnerId: newDoc.partnerId,
      expirationDate: new Date(newDoc.expirationDate),
      issueDate: newDoc.issueDate ? new Date(newDoc.issueDate) : undefined,
      isCritical: newDoc.isCritical || false,
    })

    setIsAddOpen(false)
    setNewDoc({
      name: '',
      type: 'permit',
      partnerId: 'general',
      isCritical: false,
    })
    toast({ title: 'Documento de compliance adicionado' })
  }

  const handleSaveSettings = () => {
    updateAlertLeadTime(projectId, leadTime)
    setIsSettingsOpen(false)
    toast({ title: 'Configurações de alerta atualizadas' })
  }

  const handleRenewClick = (doc: ComplianceDocument) => {
    setDocToRenew(doc)
    setRenewData({
      expirationDate: '',
      issueDate: '',
      url: '',
    })
    setIsRenewOpen(true)
  }

  const handleRenewSubmit = () => {
    if (!docToRenew || !renewData.expirationDate) return

    renewComplianceDocument(projectId, docToRenew.id, {
      expirationDate: new Date(renewData.expirationDate),
      issueDate: renewData.issueDate
        ? new Date(renewData.issueDate)
        : undefined,
      url: renewData.url || undefined,
    })

    setIsRenewOpen(false)
    toast({
      title: 'Documento Renovado',
      description: 'A nova versão foi ativada e a anterior foi arquivada.',
    })
  }

  const handleViewHistory = (doc: ComplianceDocument) => {
    setDocHistory(doc)
    setIsHistoryOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Compliance &
              Permissões
            </CardTitle>
            <CardDescription>
              Gerencie documentos críticos. Seja notificado antes do vencimento.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title="Configurações de Alerta"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações de Compliance</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Aviso de Vencimento (Dias de antecedência)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={leadTime}
                      onChange={(e) => setLeadTime(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Documentos com vencimento inferior a este prazo serão
                      marcados como alerta.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveSettings}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Documento de Compliance</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome do Documento</Label>
                    <Input
                      placeholder="Ex: Alvará de Construção"
                      value={newDoc.name}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Select
                        value={newDoc.type}
                        onValueChange={(val) =>
                          setNewDoc({ ...newDoc, type: val as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permit">
                            {t('comp.type.permit') || 'Permissões'}
                          </SelectItem>
                          <SelectItem value="city_hall">
                            {t('comp.type.city_hall') || 'Doc. Prefeitura'}
                          </SelectItem>
                          <SelectItem value="contractor_contract">
                            {t('comp.type.contractor_contract') ||
                              'Contrato da Construtora'}
                          </SelectItem>
                          <SelectItem value="constructor_insurance">
                            {t('comp.type.constructor_insurance') ||
                              'Seguro Construtor'}
                          </SelectItem>
                          <SelectItem value="owner_insurance">
                            {t('comp.type.owner_insurance') ||
                              'Seguro Proprietário'}
                          </SelectItem>
                          <SelectItem value="other">
                            {t('comp.type.other') || 'Outros'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Data de Emissão (Opcional)</Label>
                      <Input
                        type="date"
                        value={
                          newDoc.issueDate
                            ? (newDoc.issueDate as unknown as string)
                            : ''
                        }
                        onChange={(e) =>
                          setNewDoc({
                            ...newDoc,
                            issueDate: e.target.value as any,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Data de Validade</Label>
                      <Input
                        type="date"
                        value={
                          newDoc.expirationDate
                            ? (newDoc.expirationDate as unknown as string)
                            : ''
                        }
                        onChange={(e) =>
                          setNewDoc({
                            ...newDoc,
                            expirationDate: e.target.value as any,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Vincular a (Parceiro / Geral)</Label>
                      <Select
                        value={newDoc.partnerId}
                        onValueChange={(val) =>
                          setNewDoc({ ...newDoc, partnerId: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            Geral (Projeto)
                          </SelectItem>
                          {partners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(newDoc.type === 'constructor_insurance' ||
                    newDoc.type === 'owner_insurance') && (
                    <div className="grid gap-2">
                      <Label>Provedor / Seguradora</Label>
                      <Input
                        placeholder="Ex: Porto Seguro"
                        value={newDoc.provider || ''}
                        onChange={(e) =>
                          setNewDoc({ ...newDoc, provider: e.target.value })
                        }
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20 mt-2">
                    <Checkbox
                      id="critical"
                      checked={newDoc.isCritical}
                      onCheckedChange={(c) =>
                        setNewDoc({ ...newDoc, isCritical: !!c })
                      }
                    />
                    <label
                      htmlFor="critical"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Documento Crítico (Impede a execução da obra se vencido)
                    </label>
                  </div>
                  <div className="border-2 border-dashed p-4 rounded-md text-center cursor-pointer hover:bg-muted/50 mt-2">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique ou arraste o arquivo PDF aqui
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddDoc}>Salvar Documento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Renew Dialog */}
            <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renovar Documento</DialogTitle>
                  <CardDescription>
                    O documento atual será arquivado no histórico.
                  </CardDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nova Data de Emissão (Opcional)</Label>
                    <Input
                      type="date"
                      value={renewData.issueDate}
                      onChange={(e) =>
                        setRenewData({
                          ...renewData,
                          issueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Nova Data de Validade</Label>
                    <Input
                      type="date"
                      value={renewData.expirationDate}
                      onChange={(e) =>
                        setRenewData({
                          ...renewData,
                          expirationDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="border-2 border-dashed p-4 rounded-md text-center cursor-pointer hover:bg-muted/50 mt-2">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Enviar novo arquivo PDF
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRenewSubmit}>
                    Confirmar Renovação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Histórico de Versões</DialogTitle>
                  <CardDescription>{docHistory?.name}</CardDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto mt-2">
                  {docHistory?.history && docHistory.history.length > 0 ? (
                    <div className="relative border-l-2 border-muted ml-3 pl-4 space-y-4">
                      {docHistory.history.map((h, i) => (
                        <div key={h.id} className="relative">
                          <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                          <p className="text-sm font-medium">
                            Versão Arquivada {docHistory.history!.length - i}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <p>
                              <strong>Vencimento:</strong>{' '}
                              {formatDate(h.expirationDate, 'dd/MM/yyyy')}
                            </p>
                            {h.issueDate && (
                              <p>
                                <strong>Emissão:</strong>{' '}
                                {formatDate(h.issueDate, 'dd/MM/yyyy')}
                              </p>
                            )}
                            <p>
                              <strong>Arquivado em:</strong>{' '}
                              {formatDate(h.uploadedAt, 'dd/MM/yyyy HH:mm')}
                            </p>
                            {h.url && (
                              <a
                                href={h.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline mt-1 inline-flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" /> Ver Arquivo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 border rounded bg-muted/10 text-sm">
                      Nenhum histórico arquivado.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.length > 0 ? (
                  docs.map((doc) => {
                    const status = getDocStatus(doc.expirationDate)
                    const partner = partners.find((p) => p.id === doc.partnerId)
                    const linkName =
                      doc.partnerId === 'general'
                        ? 'Geral'
                        : partner?.companyName || 'Desconhecido'

                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {doc.isCritical && (
                              <AlertTriangle
                                className="h-4 w-4 text-red-500 shrink-0"
                                title="Crítico"
                              />
                            )}
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              {doc.provider && (
                                <p className="text-xs text-muted-foreground">
                                  {doc.provider}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-normal text-xs"
                          >
                            {t(`comp.type.${doc.type}`) || doc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{linkName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formatDate(doc.expirationDate, 'dd/MM/yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {status === 'valid' && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Ativo
                            </Badge>
                          )}
                          {status === 'expiring_soon' && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                              Alerta de Renovação
                            </Badge>
                          )}
                          {status === 'expired' && (
                            <Badge variant="destructive">Vencido</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Renovar"
                            onClick={() => handleRenewClick(doc)}
                          >
                            <RefreshCw className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver Histórico"
                            onClick={() => handleViewHistory(doc)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              deleteComplianceDocument(projectId, doc.id)
                            }
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
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum documento de compliance cadastrado.
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

