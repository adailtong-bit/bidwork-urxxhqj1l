import { Bell, Search, Menu, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/useAuthStore'

export function MainHeader() {
  const location = useLocation()
  const { toggleSidebar, isMobile } = useSidebar()
  const { user } = useAuthStore()

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/plans/new')) return 'Criar Novo Plano'
    if (path.includes('/plans')) return 'Meus Planos'
    if (path.includes('/reports')) return 'Relatórios'
    if (path.includes('/team')) return 'Equipe'
    if (path.includes('/settings')) return 'Configurações'
    if (path.includes('/finance')) return 'Minhas Finanças'
    return 'BIDWORK'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md transition-all">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground hidden md:block">
          {getPageTitle()}
        </h1>
        {user?.isVerified && (
          <div className="hidden md:flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" /> Verificado
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full bg-background pl-8 md:w-[200px] lg:w-[300px]"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Novo comentário</span>
                <span className="text-xs text-muted-foreground">
                  João comentou no plano "Lançamento Q3"
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Meta atingida</span>
                <span className="text-xs text-muted-foreground">
                  O plano "Vendas Q2" atingiu 100%
                </span>
              </div>
            </DropdownMenuItem>
            {user?.role === 'executor' && (
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-purple-600">
                    Recomendação IA
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Novo Job compatível com seu perfil!
                  </span>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
