import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function AccountingExport() {
  const { toast } = useToast()
  const { t, formatDate } = useLanguageStore()
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >()
  const [reportType, setReportType] = useState('general')
  const [formatType, setFormatType] = useState('csv')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: t('success'),
        description: t('finance.export.generate'),
      })
    }, 2000)
  }

  // Generate localized history data
  const historyData = [1, 2, 3].map((i) => {
    const date = new Date(2026, 1, i)
    // Dynamic month name for file title
    const month = formatDate(date, 'MMM')
    return {
      id: i,
      title: `Relatório_${month}_2026.csv`,
      date: date,
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('finance.export.title')}
        </h1>
        <p className="text-muted-foreground">{t('finance.export.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('finance.export.config_title')}</CardTitle>
            <CardDescription>{t('finance.export.config_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('finance.export.type')}</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      {t('finance.report.general')}
                    </SelectItem>
                    <SelectItem value="labor">
                      {t('finance.report.labor')}
                    </SelectItem>
                    <SelectItem value="material">
                      {t('finance.report.material')}
                    </SelectItem>
                    <SelectItem value="project">
                      {t('finance.report.project')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('finance.export.format')}</Label>
                <Select value={formatType} onValueChange={setFormatType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Excel)</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xml">XML (Nota Fiscal)</SelectItem>
                    <SelectItem value="ofx">OFX (Bancário)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('finance.export.period')}</Label>
              <div className="flex gap-2 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange?.from && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {formatDate(dateRange.from, 'P')} -{' '}
                            {formatDate(dateRange.to, 'P')}
                          </>
                        ) : (
                          formatDate(dateRange.from, 'P')
                        )
                      ) : (
                        <span>{t('general.select')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange as any} // Type casting for simplicity
                      onSelect={(range: any) => setDateRange(range)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground border border-dashed">
              <p className="font-medium text-foreground mb-1">
                {t('finance.export.included')}
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Identificação do beneficiário/pagador (CNPJ/CPF)</li>
                <li>Classificação da despesa/receita</li>
                <li>Data de competência e caixa</li>
                <li>Vinculação com Centro de Custo (Projeto)</li>
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                t('loading')
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />{' '}
                  {t('finance.export.generate')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.export.history')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {historyData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center text-green-700">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.date, 'P')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                <FileText className="h-4 w-4" />{' '}
                {t('finance.export.integration')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-4">
                {t('finance.export.integration_desc')}
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {t('finance.export.config_api')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
