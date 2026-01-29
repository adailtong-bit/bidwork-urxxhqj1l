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
  const { formatDate } = useLanguageStore()
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
        title: 'Exportação Concluída',
        description: `Relatório ${reportType} gerado em formato ${formatType.toUpperCase()}.`,
      })
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Exportação Contábil
        </h1>
        <p className="text-muted-foreground">
          Gere relatórios detalhados para integração com sistemas de
          contabilidade e conformidade fiscal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Configurar Relatório</CardTitle>
            <CardDescription>
              Selecione os parâmetros dos dados a serem extraídos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Livro Caixa Geral</SelectItem>
                    <SelectItem value="labor">
                      Folha de Pagamentos (Mão de Obra)
                    </SelectItem>
                    <SelectItem value="material">
                      Despesas com Materiais
                    </SelectItem>
                    <SelectItem value="project">
                      Custos por Centro de Custo (Projeto)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Formato de Arquivo</Label>
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
              <Label>Período de Competência</Label>
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
                            {formatDate(dateRange.from, 'LLL dd, y')} -{' '}
                            {formatDate(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          formatDate(dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Selecione o período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange as any} // Type casting for simplicity in this context
                      onSelect={(range: any) => setDateRange(range)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground border border-dashed">
              <p className="font-medium text-foreground mb-1">
                Dados incluídos na exportação:
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
                'Processando...'
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Gerar Exportação
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center text-green-700">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Relatório_Jan_2026.csv
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Gerado em 0{i}/02/2026
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
                <FileText className="h-4 w-4" /> Integração Direta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-4">
                Conecte seu software contábil (ContaAzul, Omie, etc) via API
                para sincronização automática.
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Configurar API
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
