import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  useProjectStore,
  ESTIMATION_TEMPLATES,
  ConstructionItem,
} from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileSpreadsheet, Home, Hammer } from 'lucide-react'
import { addDays } from 'date-fns'

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  projectId: string
}

export function TemplateSelector({
  open,
  onClose,
  projectId,
}: TemplateSelectorProps) {
  const { applyTemplate } = useProjectStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelectTemplate = (type: 'single-family' | 'renovation') => {
    const templateItems = ESTIMATION_TEMPLATES[type]
    const now = new Date()

    const items: ConstructionItem[] = templateItems.map((item, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      stage: item.stage,
      startDate: addDays(now, index * 5),
      endDate: addDays(now, (index + 1) * 5),
      totalPrice: 0,
    }))

    applyTemplate(projectId, items)
    toast({ title: t('est.upload.success') })
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Simulation of CSV parsing
      const mockParsedItems: ConstructionItem[] = [
        {
          id: 'custom-1',
          name: 'Custom Task 1',
          stage: 'M1',
          startDate: new Date(),
          endDate: addDays(new Date(), 5),
          totalPrice: 1000,
          isCustom: true,
        },
        {
          id: 'custom-2',
          name: 'Custom Task 2',
          stage: 'M2',
          startDate: addDays(new Date(), 6),
          endDate: addDays(new Date(), 10),
          totalPrice: 2000,
          isCustom: true,
        },
      ]

      applyTemplate(projectId, mockParsedItems)
      toast({ title: t('est.upload.success') })
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('est.template.select')}</DialogTitle>
          <DialogDescription>
            Escolha um modelo padrão ou envie seu próprio arquivo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {t('est.template.default')}
            </h3>
            <div className="grid gap-4">
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate('single-family')}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {t('est.template.single_family')}
                    </CardTitle>
                    <CardDescription>
                      Estrutura completa (M1-M4)
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate('renovation')}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Hammer className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {t('est.template.renovation')}
                    </CardTitle>
                    <CardDescription>Focado em reformas</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {t('est.template.upload')}
            </h3>
            <Card
              className="h-full border-dashed cursor-pointer hover:bg-muted/50 transition-colors flex flex-col justify-center items-center text-center p-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <CardTitle className="text-base mb-2">
                {t('est.template.upload')}
              </CardTitle>
              <CardDescription>{t('est.template.upload_desc')}</CardDescription>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.json,.xlsx"
                onChange={handleFileUpload}
              />
              <Button variant="outline" size="sm" className="mt-4">
                <FileSpreadsheet className="mr-2 h-4 w-4" />{' '}
                {t('market.import_list')}
              </Button>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
