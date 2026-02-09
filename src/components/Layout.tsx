import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { SearchHeader } from '@/components/SearchHeader'

export default function Layout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(
    location.pathname,
  )

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      {!isAuthPage && <SearchHeader />}
      <div className={`flex-1 ${!isAuthPage ? 'pb-20 md:pb-0' : ''}`}>
        <Outlet />
      </div>
      {!isAuthPage && <BottomNav />}
    </div>
  )
}
