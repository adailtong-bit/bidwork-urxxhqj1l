import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { SearchHeader } from '@/components/SearchHeader'

export default function Layout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(
    location.pathname,
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAuthPage && <SearchHeader />}
      <div className={!isAuthPage ? 'pb-20' : ''}>
        <Outlet />
      </div>
      {!isAuthPage && <BottomNav />}
    </div>
  )
}
