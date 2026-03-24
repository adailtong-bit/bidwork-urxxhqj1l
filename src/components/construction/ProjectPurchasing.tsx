import { useMaterialStore } from '@/stores/useMaterialStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function ProjectPurchasing({ projectId }: { projectId: string }) {
  const { getOrdersByProject } = useMaterialStore()
  const { formatCurrency, formatDate } = useLanguageStore()

  const orders = getOrdersByProject(projectId)

  return (
    <div className="space-y-6 min-w-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-xl border shadow-sm gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" /> Gestão de Compras
          </h3>
          <p className="text-sm text-muted-foreground">
            Empresas de Vendas e faturamentos gerados.
          </p>
        </div>
        <Button asChild>
          <Link to={`/construction/materials?projectId=${projectId}`}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Nova Compra
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto w-full">
          <Table className="min-w-[700px] w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Itens (Empresa de Vendas)</TableHead>
                <TableHead className="text-right">Faturamento Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.date, 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {order.items
                          .map((i) => `${i.quantity}x ${i.material.name}`)
                          .join(', ')}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary text-right">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Faturamento Gerado
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma compra registrada para este projeto.
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
