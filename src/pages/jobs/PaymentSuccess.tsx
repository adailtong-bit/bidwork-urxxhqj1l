import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-green-200 shadow-lg">
        <CardContent className="pt-10 pb-10 space-y-6">
          <div className="mx-auto bg-green-100 h-24 w-24 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-green-800">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              O valor foi reservado em segurança (Escrow).
              <br />O profissional foi notificado para iniciar o trabalho.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/my-jobs">
                Acompanhar Meus Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/finance">Ver Comprovante</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
