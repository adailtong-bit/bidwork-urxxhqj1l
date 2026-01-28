import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  FolderOpen,
  PlusCircle,
  Search,
  MessageSquare,
  Briefcase,
  Crown,
  Coins,
  Trophy,
  TestTube2,
  Users,
  Wallet,
  Tags,
  Megaphone,
  HardHat,
  Package,
  GraduationCap,
  Truck,
  FileSpreadsheet,
  Route,
  ClipboardList,
  Medal,
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

export function MainSidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const { state } = useSidebar()
  const isContractor = user?.role === 'contractor'
  const isPJ = user?.entityType === 'pj'
  const isAdmin = user?.role === 'admin' || user?.email.includes('admin')

  // RBAC Checks
  const hasTeamRole = !!user?.teamRole
  const canAccessFinance =
    !hasTeamRole || ['Admin', 'Accountant'].includes(user?.teamRole || '')
  const canAccessConstruction =
    !hasTeamRole || ['Admin', 'Project Manager'].includes(user?.teamRole || '')

  // Construction Company Flag (Needs PJ + Contractor)
  const isConstrutora = isPJ && isContractor

  const commonItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Minhas Mensagens',
      url: '/messages',
      icon: MessageSquare,
    },
  ]

  const contractorItems = [
    {
      title: 'Publicar Job',
      url: '/post-job',
      icon: PlusCircle,
    },
    {
      title: 'Meus Jobs',
      url: '/my-jobs',
      icon: Briefcase,
    },
  ]

  const constructionItems = [
    {
      title: 'Gestão de Obras',
      url: '/construction/dashboard',
      icon: HardHat,
    },
    {
      title: 'Materiais',
      url: '/construction/materials',
      icon: Package,
    },
    {
      title: 'Estoque & Inventário',
      url: '/construction/inventory',
      icon: ClipboardList,
    },
    {
      title: 'Logística',
      url: '/construction/logistics',
      icon: Route,
    },
    {
      title: 'Maquinário & Frota',
      url: '/construction/equipment',
      icon: Truck,
    },
  ]

  const executorItems = [
    {
      title: 'Encontrar Jobs',
      url: '/find-jobs',
      icon: Search,
    },
    {
      title: 'Minhas Candidaturas',
      url: '/my-jobs',
      icon: Briefcase,
    },
    {
      title: 'Treinamento',
      url: '/training',
      icon: GraduationCap,
    },
    {
      title: 'Ranking (Leaderboard)',
      url: '/leaderboard',
      icon: Medal,
    },
  ]

  const financeItems = [
    {
      title: 'Minhas Finanças',
      url: '/finance',
      icon: Wallet,
    },
    {
      title: 'Planos & Assinatura',
      url: '/subscription',
      icon: Crown,
    },
    {
      title: 'Créditos',
      url: '/credits',
      icon: Coins,
    },
    {
      title: 'Fidelidade',
      url: '/loyalty',
      icon: Trophy,
    },
  ]

  if (isPJ) {
    financeItems.splice(1, 0, {
      title: 'Relatórios Contábeis',
      url: '/finance/accounting',
      icon: FileSpreadsheet,
    })
  }

  const utilityItems = [
    {
      title: 'Documentos',
      url: '/documents',
      icon: FolderOpen,
    },
    {
      title: 'Configurações',
      url: '/settings',
      icon: Settings,
    },
  ]

  if (isPJ) {
    utilityItems.unshift({
      title: 'Gestão de Equipe',
      url: '/team',
      icon: Users,
    })
  } else {
    utilityItems.unshift({
      title: 'Minha Equipe',
      url: '/team',
      icon: Users,
    })
  }

  const adminItems = [
    {
      title: 'Categorias',
      url: '/admin/categories',
      icon: Tags,
    },
    {
      title: 'Publicidade',
      url: '/admin/ads',
      icon: Megaphone,
    },
  ]

  const devItems = [
    {
      title: 'Testing Hub',
      url: '/testing',
      icon: TestTube2,
    },
  ]

  const menuItems = [
    ...commonItems,
    ...(isContractor ? contractorItems : executorItems),
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex items-center justify-start px-4 border-b border-sidebar-border/50">
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
        <SidebarGroup>
          <SidebarGroupLabel>
            {isContractor ? 'Área do Contratante' : 'Área do Executor'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === item.url ||
                      location.pathname.startsWith(`${item.url}/`)
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

        {isConstrutora && canAccessConstruction && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-orange-600 font-semibold">
              Construtora
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {constructionItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        location.pathname === item.url ||
                        location.pathname.startsWith(item.url)
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
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-destructive font-bold">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
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
        )}

        {canAccessFinance && (
          <SidebarGroup>
            <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {financeItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
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
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Utilitários</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
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

        <SidebarGroup>
          <SidebarGroupLabel>Desenvolvimento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12">
                  <User2 className="shrink-0" />
                  <div className="flex flex-col gap-0.5 text-left text-sm leading-none">
                    <span className="font-semibold truncate">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate capitalize">
                      {user?.teamRole
                        ? `${user.teamRole} (${user.role})`
                        : user?.role}
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
                  <span>Sair da conta</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
