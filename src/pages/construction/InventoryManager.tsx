import { useState } from 'react'
import { useInventoryStore } from '@/stores/useInventoryStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Package,
  Plus,
  ArrowDown,
  ArrowUp,
  Search,
  RefreshCw,
  Megaphone,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function InventoryManager() {
  const { items, addItem, updateQuantity, reportShortage } = useInventoryStore()
  const { projects } = useProjectStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [selectedProject, setSelectedProject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const [newItem, setNewItem] = useState({
    materialName: '',
    quantity: '',
    unit: 'un',
    minStock: '',
    location: '',
  })

  const [shortageReport, setShortageReport] = useState({
    materialName: '',
    quantity: '',
    unit: 'un',
  })

  // Filter active projects for dynamic location
  const activeProjects = projects.filter((p) => p.status === 'in_progress')

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesProject =
      selectedProject === 'all' || item.projectId === selectedProject
    const matchesSearch = item.materialName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesProject && matchesSearch
  })

  // Check alerts
  const lowStockItems = items.filter((item) => item.quantity <= item.minStock)

  const handleAddItem = () => {
    if (
      !newItem.materialName ||
      !newItem.quantity ||
      !newItem.minStock ||
      selectedProject === 'all'
    ) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('val.required'),
      })
      return
    }

    const project = projects.find((p) => p.id === selectedProject)
    const locationName = project
      ? `${project.name} (${project.location})`
      : newItem.location

    addItem({
      projectId: selectedProject,
      materialName: newItem.materialName,
      quantity: Number(newItem.quantity),
      unit: newItem.unit,
      minStock: Number(newItem.minStock),
      location: locationName,
    })

    setIsAddOpen(false)
    setNewItem({
      materialName: '',
      quantity: '',
      unit: 'un',
      minStock: '',
      location: '',
    })
    toast({ title: t('success') })
  }

  const handleReportShortage = () => {
    if (!selectedProject || selectedProject === 'all') {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('val.required'),
      })
      return
    }

    reportShortage({
      projectId: selectedProject,
      materialName: shortageReport.materialName,
      quantity: Number(shortageReport.quantity),
      unit: shortageReport.unit,
    })
    setIsReportOpen(false)
    setShortageReport({ materialName: '', quantity: '', unit: 'un' })
    toast({
      title: t('success'),
      description: t('inventory.report.desc'),
    })
  }

  const handleUpdateStock = (id: string, current: number, delta: number) => {
    const newQty = Math.max(0, current + delta)
    updateQuantity(id, newQty)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('inventory.title')}
        </h1>
        <p className="text-muted-foreground">{t('inventory.desc')}</p>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-l-destructive bg-destructive/10">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> {t('inventory.low_stock')}
            </CardTitle>
            <CardDescription>
              {t('inventory.low_stock_desc', { count: lowStockItems.length })}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-[300px]">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder={t('inventory.select_project')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('inventory.all_projects')}</SelectItem>
              {activeProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('inventory.search_placeholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700"
              >
                <Megaphone className="mr-2 h-4 w-4" />{' '}
                {t('inventory.report_shortage')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('inventory.report.title')}</DialogTitle>
                <DialogDescription>
                  {t('inventory.report.desc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t('inventory.field.material')}</Label>
                  <Input
                    value={shortageReport.materialName}
                    onChange={(e) =>
                      setShortageReport({
                        ...shortageReport,
                        materialName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('inventory.field.quantity')}</Label>
                    <Input
                      type="number"
                      value={shortageReport.quantity}
                      onChange={(e) =>
                        setShortageReport({
                          ...shortageReport,
                          quantity: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('inventory.field.unit')}</Label>
                    <Input
                      value={shortageReport.unit}
                      onChange={(e) =>
                        setShortageReport({
                          ...shortageReport,
                          unit: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleReportShortage}>
                  {t('inventory.send_request')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button disabled={selectedProject === 'all'}>
                <Plus className="mr-2 h-4 w-4" /> {t('inventory.new_item')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('inventory.add.title')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t('inventory.field.name')}</Label>
                  <Input
                    value={newItem.materialName}
                    onChange={(e) =>
                      setNewItem({ ...newItem, materialName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('inventory.field.initial_qty')}</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({ ...newItem, quantity: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('inventory.field.unit')}</Label>
                    <Input
                      placeholder="kg, m³, un"
                      value={newItem.unit}
                      onChange={(e) =>
                        setNewItem({ ...newItem, unit: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{t('inventory.field.min_stock')}</Label>
                  <Input
                    type="number"
                    value={newItem.minStock}
                    onChange={(e) =>
                      setNewItem({ ...newItem, minStock: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('inventory.field.location')}</Label>
                  <Input
                    value={
                      projects.find((p) => p.id === selectedProject)?.name ||
                      'Manual'
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem}>
                  {t('inventory.save_item')}
                </Button>
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
                <TableHead>{t('inventory.table.material')}</TableHead>
                <TableHead>{t('inventory.table.local')}</TableHead>
                <TableHead>{t('inventory.table.current')}</TableHead>
                <TableHead>{t('inventory.table.min')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minStock
                return (
                  <TableRow key={item.id} className={isLow ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {item.materialName}
                        {isLow && (
                          <Badge variant="destructive" className="text-[10px]">
                            BAIXO
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <div className="font-bold">
                        {item.quantity} {item.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.minStock} {item.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateStock(item.id, item.quantity, -1)
                          }
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateStock(item.id, item.quantity, 1)
                          }
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('inventory.empty')}
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
