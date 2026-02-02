import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { MainSidebar } from './MainSidebar'
import { MainHeader } from './MainHeader'
import { BottomNav } from '@/components/BottomNav'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 transition-colors">
        <MainHeader />
        <main className="flex-1 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-fade-in pb-20 md:pb-8">
          <Outlet />
        </main>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
