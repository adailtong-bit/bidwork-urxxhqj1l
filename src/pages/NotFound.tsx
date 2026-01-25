import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
      <h1 className="text-9xl font-black text-primary/10">404</h1>
      <h2 className="text-2xl font-bold text-foreground mt-4">
        Página não encontrada
      </h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  )
}
