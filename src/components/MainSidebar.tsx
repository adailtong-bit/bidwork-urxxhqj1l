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
import { useLanguageStore } from '@/stores/useLanguageStore'

export function MainSidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const { state } = useSidebar()
  const { t } = useLanguageStore()

  const isContractor = user?.role === 'contractor'
  const isPartner = user?.role === 'partner'
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
      title: isPartner
        ? t('sidebar.partner_dashboard')
        : t('sidebar.dashboard'),
      url: isPartner ? '/partner/dashboard' : '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('sidebar.messages'),
      url: '/messages',
      icon: MessageSquare,
    },
  ]

  const contractorItems = [
    {
      title: t('sidebar.post_job'),
      url: '/post-job',
      icon: PlusCircle,
    },
    {
      title: t('sidebar.my_jobs'),
      url: '/my-jobs',
      icon: Briefcase,
    },
  ]

  const constructionItems = [
    {
      title: t('sidebar.construction'),
      url: '/construction/dashboard',
      icon: HardHat,
    },
    {
      title: t('sidebar.materials'),
      url: '/construction/materials',
      icon: Package,
    },
    {
      title: t('sidebar.inventory'),
      url: '/construction/inventory',
      icon: ClipboardList,
    },
    {
      title: t('sidebar.logistics'),
      url: '/construction/logistics',
      icon: Route,
    },
    {
      title: t('sidebar.equipment'),
      url: '/construction/equipment',
      icon: Truck,
    },
  ]

  const executorItems = [
    {
      title: t('sidebar.find_jobs'),
      url: '/find-jobs',
      icon: Search,
    },
    {
      title: t('sidebar.applications'),
      url: '/my-jobs',
      icon: Briefcase,
    },
    {
      title: t('sidebar.training'),
      url: '/training',
      icon: GraduationCap,
    },
    {
      title: t('sidebar.leaderboard'),
      url: '/leaderboard',
      icon: Medal,
    },
  ]

  const partnerItems = [
    {
      title: t('sidebar.team'),
      url: '/partner/dashboard', // handled via tabs in dashboard for simplicity
      icon: Users,
    },
    {
      title: t('sidebar.invoices'),
      url: '/finance',
      icon: FileSpreadsheet,
    },
  ]

  const financeItems = [
    {
      title: t('sidebar.finance'),
      url: '/finance',
      icon: Wallet,
    },
    {
      title: t('sidebar.subscription'),
      url: '/subscription',
      icon: Crown,
    },
    {
      title: t('sidebar.credits'),
      url: '/credits',
      icon: Coins,
    },
    {
      title: t('sidebar.loyalty'),
      url: '/loyalty',
      icon: Trophy,
    },
  ]

  if (isPJ) {
    financeItems.splice(1, 0, {
      title: t('sidebar.accounting'),
      url: '/finance/accounting',
      icon: FileSpreadsheet,
    })
  }

  const utilityItems = [
    {
      title: t('sidebar.documents'),
      url: '/documents',
      icon: FolderOpen,
    },
    {
      title: t('sidebar.settings'),
      url: '/settings',
      icon: Settings,
    },
  ]

  if (isPJ) {
    utilityItems.unshift({
      title: t('sidebar.users'),
      url: '/team',
      icon: Users,
    })
  }

  const adminItems = [
    {
      title: t('sidebar.categories'),
      url: '/admin/categories',
      icon: Tags,
    },
    {
      title: t('sidebar.ads'),
      url: '/admin/ads',
      icon: Megaphone,
    },
  ]

  const devItems = [
    {
      title: t('sidebar.testing'),
      url: '/testing',
      icon: TestTube2,
    },
  ]

  let menuItems = [...commonItems]
  if (isContractor) menuItems = [...menuItems, ...contractorItems]
  else if (isPartner) menuItems = [...menuItems, ...partnerItems]
  else menuItems = [...menuItems, ...executorItems]

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
            {isContractor
              ? t('sidebar.group.contractor')
              : isPartner
                ? t('sidebar.group.partner')
                : t('sidebar.group.executor')}
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
              {t('sidebar.group.construction')}
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
              {t('sidebar.group.admin')}
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
            <SidebarGroupLabel>{t('sidebar.group.finance')}</SidebarGroupLabel>
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
          <SidebarGroupLabel>{t('sidebar.group.utilities')}</SidebarGroupLabel>
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
          <SidebarGroupLabel>{t('sidebar.group.dev')}</SidebarGroupLabel>
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
                  <span>{t('sidebar.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
