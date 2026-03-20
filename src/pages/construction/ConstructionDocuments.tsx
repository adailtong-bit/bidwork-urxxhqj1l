import { useState } from 'react'
import {
  useConstructionDocumentStore,
  DocumentStatus,
} from '@/stores/useConstructionDocumentStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
  FileText,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react'
import { differenceInDays, isBefore } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

const BR_DOCS = [
  'Matrícula',
  'Certidões Negativas',
  'Projetos (ART/RRT)',
  'Alvará de Construção',
  'Habite-se',
]
const US_DOCS = [
  'Survey',
  'Zoning Approval',
  'Signed Plans',
  'Building Permit',
  'Notice of Commencement',
  'Certificate of Occupancy',
]

export default function ConstructionDocuments() {
  const { documents, addDocument, deleteDocument } =
    useConstructionDocumentStore()
  const { projects } = useProjectStore()
  const { t, formatDate } = useLanguageStore()
  const { toast } = useToast()

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newDoc, setNewDoc] = useState({
    type: '',
    name: '',
    requestDate: '',
    approvalDate: '',
    validity: '',
    partnerId: 'none',
    status: 'Pending' as DocumentStatus,
  })

  const activeProjects = projects.filter(
    (p) => p.status === 'in_progress' || p.status === 'planning',
  )

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const projectPartners = selectedProject?.partners || []

  const filteredDocuments = documents.filter(
    (d) => !selectedProjectId || d.projectId === selectedProjectId,
  )

  const handleAdd = () => {
    if (
      !selectedProjectId ||
      !newDoc.name ||
      !newDoc.requestDate ||
      !newDoc.type
    ) {
      toast({
        variant: 'destructive',
        title: 'Campos Obrigatórios',
        description: 'Preencha o projeto, nome, tipo e data de solicitação.',
      })
      return
    }

    addDocument({
      projectId: selectedProjectId,
      type: newDoc.type,
      name: newDoc.name,
      requestDate: new Date(newDoc.requestDate),
      approvalDate: newDoc.approvalDate
        ? new Date(newDoc.approvalDate)
        : undefined,
      validity: newDoc.validity ? new Date(newDoc.validity) : undefined,
      partnerId: newDoc.partnerId === 'none' ? undefined : newDoc.partnerId,
      status: newDoc.status,
    })

    setIsAddOpen(false)
    setNewDoc({
      type: '',
      name: '',
      requestDate: '',
      approvalDate: '',
      validity: '',
      partnerId: 'none',
      status: 'Pending',
    })
    toast({ title: 'Documento Adicionado' })
  }

  const getStatusBadge = (doc: any) => {
    if (doc.status === 'Expired' || (doc.validity && isBefore(doc.validity, new Date()))) {
      return (
        <Badge variant="destructive" className="flex gap-1">
          <AlertTriangle className="h-3 w-3" /> {t('docs.expired')}
        </Badge>
      )
    }
    if (doc.status === 'Pending') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" /> {t('status.pending')}
        </Badge>
      )
    }
    if (doc.status === 'In Progress') {
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
          <Clock className="h-3 w-3 mr-1" /> Em Andamento
        </Badge>
      )
    }
    return (
      <Badge className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" /> {t('status.completed')}
      </Badge>
    )
  }

  const docTypes =
    selectedProject?.region === 'US'
      ? US_DOCS
      : selectedProject?.region === 'BR'
        ? BR_DOCS
        : [...BR_DOCS, ...US_DOCS, 'Insurance', 'Water', 'Electric', 'Sewage']

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Documentação de Obra
          </h1>
          <p className="text-muted-foreground">
            Permissões, licenças e documentos regionais.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione o Projeto" />
            </SelectTrigger>
            <SelectContent>
              {activeProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedProjectId}>
                <Plus className="mr-2 h-4 w-4" /> Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Documento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newDoc.type}
                    onValueChange={(val) =>
                      setNewDoc({ ...newDoc, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {docTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Nome / Descrição</Label>
                  <Input
                    value={newDoc.name}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={newDoc.status}
                      onValueChange={(val) =>
                        setNewDoc({ ...newDoc, status: val as DocumentStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pendente</SelectItem>
                        <SelectItem value="In Progress">Em Andamento</SelectItem>
                        <SelectItem value="Approved">Aprovado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Validade (Opcional)</Label>
                    <Input
                      type="date"
                      value={newDoc.validity}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, validity: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data Solicitação</Label>
                    <Input
                      type="date"
                      value={newDoc.requestDate}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, requestDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Data Aprovação (Opcional)</Label>
                    <Input
                      type="date"
                      value={newDoc.approvalDate}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, approvalDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Vincular Parceiro (Opcional)</Label>
                  <Select
                    value={newDoc.partnerId}
                    onValueChange={(val) =>
                      setNewDoc({ ...newDoc, partnerId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {projectPartners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>{t('docs.validity')}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => {
                  const daysLeft =
                    doc.validity &&
                    differenceInDays(new Date(doc.validity), new Date())
                  const isWarning = daysLeft && daysLeft > 0 && daysLeft < 30
                  const project = projects.find((p) => p.id === doc.projectId)
                  const partner = project?.partners.find(
                    (p) => p.id === doc.partnerId,
                  )

                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {project?.name}
                      </TableCell>
                      <TableCell>
                        {partner ? (
                          <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                            <LinkIcon className="h-3 w-3" />
                            {partner.companyName}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {doc.validity
                              ? formatDate(doc.validity, 'dd/MM/yyyy')
                              : '-'}
                          </span>
                          {daysLeft && daysLeft > 0 && (
                            <span
                              className={`text-xs ${
                                isWarning
                                  ? 'text-orange-500 font-bold'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {t('docs.days_left', { days: daysLeft })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteDocument(doc.id)}
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
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum documento encontrado. Selecione um projeto ou
                    adicione novos registros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

