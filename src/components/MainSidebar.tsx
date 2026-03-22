import { useState } from 'react'
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  FolderOpen,
  PlusCircle,
  Search,
  Briefcase,
  Crown,
  Trophy,
  TestTube2,
  Users,
  Wallet,
  Tags,
  Megaphone,
  HardHat,
  Home,
  Wrench,
  LogIn,
  UserPlus,
  Mail,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { PublishModal } from '@/components/PublishModal'

interface SidebarSection {
  label: string
  className?: string
  items: { title: string; url: string; icon: any }[]
}

export function MainSidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const { state } = useSidebar()
  const [isPublishOpen, setIsPublishOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.email.includes('admin')

  // Unified Navigation System supporting dual-role inherently
  let sections: SidebarSection[] = []

  if (!user) {
    sections.push({
      label: 'Visitante',
      items: [
        { title: 'Início', url: '/', icon: Home },
        { title: 'Serviços', url: '/services', icon: Wrench },
        { title: 'Encontrar Jobs', url: '/find-jobs', icon: Search },
        { title: 'Login', url: '/login', icon: LogIn },
        { title: 'Cadastrar', url: '/register', icon: UserPlus },
      ],
    })
  } else {
    sections.push({
      label: 'Navegação e Vagas',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Encontrar Jobs', url: '/find-jobs', icon: Search },
        { title: 'Minhas Atividades', url: '/my-jobs', icon: HardHat },
        { title: 'Mensagens', url: '/messages', icon: Mail },
      ],
    })

    sections.push({
      label: 'Gestão de Obras (Contratante)',
      className: 'text-orange-600 font-semibold',
      items: [
        {
          title: 'Minhas Obras',
          url: '/construction/dashboard',
          icon: Briefcase,
        },
        { title: 'Painel do Parceiro', url: '/partner/dashboard', icon: Users },
        { title: 'Equipe Corporativa', url: '/team', icon: Users },
      ],
    })

    if (isAdmin) {
      sections.push({
        label: 'Administração',
        className: 'text-destructive font-bold',
        items: [
          {
            title: 'Gestão de Planos',
            url: '/admin/plans',
            icon: Crown,
          },
          {
            title: 'Planos de Obras',
            url: '/admin/construction-plans',
            icon: HardHat,
          },
          { title: 'Categorias', url: '/admin/categories', icon: Tags },
          { title: 'Anúncios', url: '/admin/ads', icon: Megaphone },
        ],
      })
    }

    sections.push({
      label: 'Financeiro e Utilitários',
      items: [
        { title: 'Painel Financeiro', url: '/finance', icon: Wallet },
        { title: 'Planos e Assinatura', url: '/subscription', icon: Crown },
        { title: 'Ranking e Prêmios', url: '/leaderboard', icon: Trophy },
        { title: 'Documentos', url: '/documents', icon: FolderOpen },
        { title: 'Configurações', url: '/settings', icon: Settings },
      ],
    })

    sections.push({
      label: 'Ferramentas de Teste',
      items: [{ title: 'Testing Hub', url: '/testing', icon: TestTube2 }],
    })
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-auto flex flex-col justify-start px-4 py-4 border-b border-sidebar-border/50 gap-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary truncate overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              B
            </div>
            <span
              className={cn(
                'transition-opacity duration-200',
                state === 'collapsed' ? 'opacity-0 w-0' : 'opacity-100',
              )}
            >
              BIDWORK
            </span>
          </div>

          {user && state !== 'collapsed' && (
            <Button
              onClick={() => setIsPublishOpen(true)}
              className="w-full justify-start shadow-md"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Publicar
            </Button>
          )}
          {user && state === 'collapsed' && (
            <Button
              onClick={() => setIsPublishOpen(true)}
              className="w-8 h-8 p-0 mx-auto"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          )}
        </SidebarHeader>
        <SidebarContent>
          {sections.map((section, idx) => (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel className={section.className}>
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          location.pathname === item.url ||
                          (item.url !== '/' &&
                            location.pathname.startsWith(`${item.url}/`))
                        }
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        {user && (
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-12">
                      <User2 className="shrink-0" />
                      <div className="flex flex-col gap-0.5 text-left text-sm leading-none">
                        <span className="font-semibold truncate">
                          {user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate capitalize">
                          {user.role}{' '}
                          {user.entityType === 'pj' ? '(PJ)' : '(PF)'}
                        </span>
                      </div>
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair da Conta</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        )}
      </Sidebar>

      <PublishModal open={isPublishOpen} onOpenChange={setIsPublishOpen} />
    </>
  )
}
