import { Search, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { LanguageSelector } from '@/components/LanguageSelector'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotificationStore } from '@/stores/useNotificationStore'

export function SearchHeader() {
  const { t } = useLanguageStore()
  const { user, isAuthenticated } = useAuthStore()
  const { notifications, getUnreadCount, markAsRead } = useNotificationStore()
  const location = useLocation()

  const unreadCount = user ? getUnreadCount(user.id) : 0
  const userNotifications = notifications.filter((n) => n.userId === user?.id)

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="shrink-0" />

        {/* Logo - Hide on mobile if searching or navigating deep, or keep it simple */}
        <Link
          to="/"
          className="font-bold text-xl text-primary shrink-0 hidden md:block"
        >
          BIDWORK
        </Link>

        {/* Search Bar - Global */}
        <div className="flex-1 max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              className="w-full bg-muted pl-9 rounded-full h-9"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <LanguageSelector />

          {isAuthenticated ? (
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
                <DropdownMenuLabel>
                  {t('header.notifications')}
                </DropdownMenuLabel>
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
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">{t('nav.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
