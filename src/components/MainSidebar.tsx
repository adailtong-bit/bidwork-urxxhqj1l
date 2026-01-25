import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  FolderOpen,
  PlusCircle,
  Search,
  MessageSquare,
  Briefcase,
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

  // Common items
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

  // Role specific items
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

  const executorItems = [
    {
      title: 'Encontrar Jobs',
      url: '/find-jobs',
      icon: Search,
    },
    {
      title: 'Minhas Candidaturas',
      url: '/my-jobs', // Reusing route but filtered for executor logic
      icon: Briefcase,
    },
  ]

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

  const menuItems = [
    ...commonItems,
    ...(isContractor ? contractorItems : executorItems),
    ...utilityItems,
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
                      {user?.role}
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
