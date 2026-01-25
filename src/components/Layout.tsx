// Wrapper component to be used if we need a global context provider or similar
// For this app structure, we are using AuthLayout and DashboardLayout specific wrappers
// But router expects a Layout element for the base route if we want one
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return <Outlet />
}
