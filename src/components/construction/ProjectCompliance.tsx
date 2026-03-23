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
  } = useProjectStore()
  const { t, formatDate } = useLanguageStore()
  const { toast } = useToast()

  const project = getProject(projectId)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [leadTime, setLeadTime] = useState(project?.alertLeadTimeDays || 30)

  const [newDoc, setNewDoc] = useState<Partial<ComplianceDocument>>({
    name: '',
    type: 'insurance',
    partnerId: 'general',
    isCritical: false,
  })

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
      isCritical: newDoc.isCritical || false,
    })

    setIsAddOpen(false)
    setNewDoc({
      name: '',
      type: 'insurance',
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
              Gerencie seguros, licenças e alvarás. Seja notificado antes do
              vencimento.
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
                      placeholder="Ex: Seguro de Risco Civil"
                      value={newDoc.name}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tipo</Label>
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
                          <SelectItem value="insurance">Seguro</SelectItem>
                          <SelectItem value="license">
                            Alvará/Licença
                          </SelectItem>
                          <SelectItem value="permission">
                            Permissão de Trabalho
                          </SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Vencimento</Label>
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
                        <SelectItem value="general">Geral (Projeto)</SelectItem>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newDoc.type === 'insurance' && (
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
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
                        ? 'Geral (Projeto)'
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
                              <p className="text-xs text-muted-foreground">
                                {doc.type === 'insurance'
                                  ? 'Seguro'
                                  : doc.type === 'license'
                                    ? 'Licença'
                                    : 'Outro'}
                                {doc.provider && ` • ${doc.provider}`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{linkName}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(doc.expirationDate, 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {status === 'valid' && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Válido
                            </Badge>
                          )}
                          {status === 'expiring_soon' && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                              Vence em Breve
                            </Badge>
                          )}
                          {status === 'expired' && (
                            <Badge variant="destructive">Vencido</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver Arquivo"
                          >
                            <FileText className="h-4 w-4" />
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
                      colSpan={5}
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
