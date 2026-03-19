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
import { useAuthStore } from '@/stores/useAuthStore'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SidebarSection {
  label: string
  className?: string
  items: { title: string; url: string; icon: any }[]
}

export function MainSidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const { state } = useSidebar()

  const isContractor = user?.role === 'contractor'
  const isPJ = user?.entityType === 'pj'
  const isAdmin = user?.role === 'admin' || user?.email.includes('admin')

  // Build the menu strictly based on RBAC and Acceptance Criteria
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
    // 1. General Dashboard for logged users
    sections.push({
      label: 'Principal',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Mensagens', url: '/messages', icon: Mail },
        { title: 'Postar Novo Job', url: '/post-job', icon: PlusCircle }, // Available broadly
      ],
    })

    // 2. Specific Role Sections
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
          { title: 'Gestão de Usuários', url: '/team', icon: Users },
          { title: 'Categorias', url: '/admin/categories', icon: Tags },
          { title: 'Anúncios', url: '/admin/ads', icon: Megaphone },
        ],
      })
    } else if (isContractor && isPJ) {
      // Contractor PJ
      sections.push({
        label: 'Gestão de Obras (PJ)',
        className: 'text-orange-600 font-semibold',
        items: [
          { title: 'Minha Equipe', url: '/team', icon: Users },
          {
            title: 'Minhas Obras',
            url: '/construction/dashboard',
            icon: Briefcase,
          },
          { title: 'Assinaturas', url: '/subscription', icon: Crown },
        ],
      })
    } else if (user.role === 'executor') {
      // Service Provider
      sections.push({
        label: 'Provedor de Serviços',
        items: [
          { title: 'Ranking', url: '/leaderboard', icon: Trophy },
          { title: 'Encontrar Jobs', url: '/find-jobs', icon: Search },
          { title: 'Meus Ganhos', url: '/finance', icon: Wallet },
          { title: 'Planos', url: '/subscription', icon: Crown },
        ],
      })
    } else {
      // Fallback for PF Contractors or other combinations to keep UX functional
      sections.push({
        label: 'Meus Projetos',
        items: [
          { title: 'Minhas Atividades', url: '/my-jobs', icon: Briefcase },
          { title: 'Painel Financeiro', url: '/finance', icon: Wallet },
          { title: 'Planos', url: '/subscription', icon: Crown },
        ],
      })
    }

    // 3. Utilities for everyone
    sections.push({
      label: 'Utilitários',
      items: [
        { title: 'Documentos', url: '/documents', icon: FolderOpen },
        { title: 'Configurações', url: '/settings', icon: Settings },
      ],
    })

    // 4. Dev Hub
    sections.push({
      label: 'Ferramentas de Teste',
      items: [{ title: 'Testing Hub', url: '/testing', icon: TestTube2 }],
    })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-start px-4 border-b border-sidebar-border/50">
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
                        {user.role} {user.entityType === 'pj' ? '(PJ)' : '(PF)'}
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
  )
}
