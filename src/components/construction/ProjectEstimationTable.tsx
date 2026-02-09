import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectStore, ConstructionItem } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Trash2, Plus, CalendarIcon } from 'lucide-react'
import { CurrencyInput } from '@/components/CurrencyInput'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface ProjectEstimationTableProps {
  projectId: string
}

export function ProjectEstimationTable({
  projectId,
}: ProjectEstimationTableProps) {
  const {
    getProject,
    addConstructionItem,
    removeConstructionItem,
    updateConstructionItem,
  } = useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const project = getProject(projectId)

  const [newItem, setNewItem] = useState<{
    name: string
    stage: string
  } | null>(null)

  if (!project) return null

  const items = project.constructionItems || []
  const stages = ['M1', 'M2', 'M3', 'M4']

  const handleUpdateItem = (
    id: string,
    field: keyof ConstructionItem,
    value: any,
  ) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    let updates: Partial<ConstructionItem> = { [field]: value }

    // Pricing Logic
    if (field === 'pricePerSqFt') {
      const sqFt = project.sqFt || 0
      updates.totalPrice = (Number(value) || 0) * sqFt
    }

    updateConstructionItem(projectId, id, updates)
  }

  const handleAddItem = (stage: string) => {
    addConstructionItem(projectId, {
      name: 'Novo Item',
      stage,
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 0,
    })
  }

  const getStageTotal = (stage: string) => {
    return items
      .filter((i) => i.stage === stage)
      .reduce((acc, i) => acc + i.totalPrice, 0)
  }

  const groupedItems = stages.map((stage) => ({
    stage,
    items: items.filter((i) => i.stage === stage),
    total: getStageTotal(stage),
  }))

  return (
    <div className="space-y-8">
      {groupedItems.map((group) => (
        <div key={group.stage} className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-4 flex justify-between items-center border-b">
            <h3 className="font-semibold text-lg">
              {t(`est.stage.${group.stage.toLowerCase()}`) || group.stage}
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {t('est.total.stage')}:{' '}
                <span className="text-primary text-base">
                  {formatCurrency(group.total)}
                </span>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddItem(group.stage)}
              >
                <Plus className="mr-2 h-3 w-3" /> {t('add')}
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">{t('est.table.item')}</TableHead>
                <TableHead className="w-[15%]">
                  {t('est.table.start')}
                </TableHead>
                <TableHead className="w-[15%]">{t('est.table.end')}</TableHead>
                <TableHead className="w-[15%] text-right">
                  {t('est.table.sqft_price')}
                </TableHead>
                <TableHead className="w-[15%] text-right">
                  {t('est.table.total')}
                </TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.items.length > 0 ? (
                group.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'name', e.target.value)
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal h-8 text-xs',
                              !item.startDate && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {item.startDate ? (
                              formatDate(item.startDate, 'dd/MM/yy')
                            ) : (
                              <span>Selecione</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={item.startDate}
                            onSelect={(date) =>
                              date &&
                              handleUpdateItem(item.id, 'startDate', date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal h-8 text-xs',
                              !item.endDate && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {item.endDate ? (
                              formatDate(item.endDate, 'dd/MM/yy')
                            ) : (
                              <span>Selecione</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={item.endDate}
                            onSelect={(date) =>
                              date && handleUpdateItem(item.id, 'endDate', date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        className="h-8 text-right"
                        value={item.pricePerSqFt || ''}
                        placeholder={project.sqFt ? '0.00' : '-'}
                        disabled={!project.sqFt}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            'pricePerSqFt',
                            parseFloat(e.target.value),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyInput
                        className="h-8 text-right font-bold"
                        value={item.totalPrice}
                        disabled={!!item.pricePerSqFt && !!project.sqFt}
                        onChange={(val) =>
                          handleUpdateItem(item.id, 'totalPrice', val)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          removeConstructionItem(projectId, item.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-muted-foreground text-xs"
                  >
                    Nenhum item nesta etapa.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
