import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  // Sidebar and Header are now handled globally by Layout.tsx
  // This component acts as a wrapper for dashboard-specific content styling
  return (
    <div className="flex flex-col min-h-full">
      <main className="flex-1 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
