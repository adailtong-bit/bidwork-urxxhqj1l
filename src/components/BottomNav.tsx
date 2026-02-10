import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  PlusCircle,
  Briefcase,
  User,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function BottomNav() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { t } = useLanguageStore()

  const isContractor = user?.role === 'contractor'

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full space-y-1',
            isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('nav.home')}</span>
        </Link>

        {isContractor ? (
          <Link
            to="/my-jobs"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1',
              isActive('/my-jobs') ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t('nav.projects')}</span>
          </Link>
        ) : (
          <Link
            to="/find-jobs"
            className={cn(
              'flex flex-col items-center justify-center w-full h-full space-y-1',
              isActive('/find-jobs') ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">
              {t('nav.find_jobs')}
            </span>
          </Link>
        )}

        <Link
          to="/post-job"
          className="flex flex-col items-center justify-center w-full h-full space-y-1 -mt-6"
        >
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
            <PlusCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-medium">{t('nav.post')}</span>
        </Link>

        <Link
          to="/messages"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full space-y-1',
            isActive('/messages') ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('nav.inbox')}</span>
        </Link>

        <Link
          to="/settings"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full space-y-1',
            isActive('/settings') ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t('nav.account')}</span>
        </Link>
      </div>
    </div>
  )
}
