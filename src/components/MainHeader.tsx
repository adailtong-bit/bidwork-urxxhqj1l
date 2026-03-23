import { Bell, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLocation, Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { LanguageSelector } from '@/components/LanguageSelector'
import { HeaderSearch } from '@/components/HeaderSearch'

export function MainHeader() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { notifications, getUnreadCount, markAsRead } = useNotificationStore()
  const { t } = useLanguageStore()

  const unreadCount = user ? getUnreadCount(user.id) : 0
  const userNotifications = notifications.filter((n) => n.userId === user?.id)

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return t('nav.dashboard')
    if (path.includes('/plans/new')) return t('nav.plans')
    if (path.includes('/plans')) return t('nav.plans')
    if (path.includes('/reports')) return t('header.reports')
    if (path.includes('/team')) return t('nav.team')
    if (path.includes('/settings')) return t('nav.settings')
    if (path.includes('/finance')) return t('nav.finance')
    return t('app.title')
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
            <CheckCircle2 className="h-3 w-3" /> {t('header.verified')}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block w-64 lg:w-[300px]">
          <HeaderSearch inputClassName="bg-background h-10" />
        </div>

        <LanguageSelector />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
              )}
              <span className="sr-only">{t('header.notifications')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userNotifications.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">
                {t('header.notifications.empty')}
              </div>
            ) : (
              userNotifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                  asChild
                >
                  <Link
                    to={notification.link || '#'}
                    className="flex flex-col gap-1 items-start"
                  >
                    <div className="flex justify-between w-full">
                      <span
                        className={`font-medium ${!notification.read ? 'text-primary' : ''}`}
                      >
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-1" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-xs text-muted-foreground">
              {t('header.notifications.view_all')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
