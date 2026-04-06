import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Loader2, Activity, Database, UserSquare2 } from 'lucide-react'

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(
          `
          *,
          profiles!user_id(name, email)
        `,
        )
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        setLogs(data)
      }
      setLoading(false)
    }
    fetchLogs()
  }, [])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'UPDATE':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'DELETE':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const formatData = (data: any) => {
    if (!data) return '-'
    try {
      const stringified = JSON.stringify(data, null, 2)
      // Limit size for display
      return stringified.length > 50
        ? stringified.substring(0, 50) + '...'
        : stringified
    } catch {
      return '-'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs do Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Trilha de auditoria e monitoramento de atividades (Dashboard
            Master).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
          <CardDescription>
            Mostrando as últimas 100 alterações críticas no banco de dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Registro ID</TableHead>
                  <TableHead>Dados Antigos</TableHead>
                  <TableHead>Novos Dados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                      Carregando logs de auditoria...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum registro de auditoria encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap font-medium text-xs">
                        {format(
                          new Date(log.created_at),
                          'dd/MM/yyyy HH:mm:ss',
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserSquare2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {log.profiles?.name ||
                              log.profiles?.email ||
                              'Sistema / Desconhecido'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getActionColor(log.action)}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Database className="w-4 h-4" />
                          {log.entity_type}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.entity_id?.split('-')[0]}...
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground max-w-[150px] truncate">
                        {formatData(log.old_data)}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground max-w-[150px] truncate">
                        {formatData(log.new_data)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
