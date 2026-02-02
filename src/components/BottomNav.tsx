import { Link, useLocation } from 'react-router-dom'
import { Home, MessageSquare, PlusCircle, List, User } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const { t } = useLanguageStore()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { label: t('nav.home'), icon: Home, path: '/' },
    { label: t('nav.inbox'), icon: MessageSquare, path: '/messages' },
    {
      label: t('nav.post'),
      icon: PlusCircle,
      path: '/post-job',
      highlight: true,
    },
    { label: t('nav.listings'), icon: List, path: '/my-jobs' },
    { label: t('nav.account'), icon: User, path: '/dashboard' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe pt-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-end h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full pb-2 pt-1 transition-colors duration-200',
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon
              className={cn(
                'mb-1 transition-all',
                item.highlight ? 'h-7 w-7' : 'h-6 w-6',
                isActive(item.path) ? 'scale-110' : 'scale-100',
              )}
              strokeWidth={isActive(item.path) ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
