import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/components/DashboardLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Dashboard from '@/pages/dashboard/Dashboard'
import PlansList from '@/pages/plans/PlansList'
import PlanDetail from '@/pages/plans/PlanDetail'
import Documents from '@/pages/documents/Documents'
import Reports from '@/pages/reports/Reports'
import Team from '@/pages/team/Team'
import Settings from '@/pages/settings/Settings'
import NotFound from '@/pages/NotFound'
import PostJob from '@/pages/jobs/PostJob'
import FindJobs from '@/pages/jobs/FindJobs'
import MyJobs from '@/pages/jobs/MyJobs'
import JobDetail from '@/pages/jobs/JobDetail'
import Dispute from '@/pages/jobs/Dispute'
import PaymentCheckout from '@/pages/jobs/PaymentCheckout'
import PaymentSuccess from '@/pages/jobs/PaymentSuccess'
import SubscriptionPlans from '@/pages/subscription/SubscriptionPlans'
import CreditsStore from '@/pages/billing/CreditsStore'
import LoyaltyProgram from '@/pages/loyalty/LoyaltyProgram'
import TestingHub from '@/pages/testing/TestingHub'
import FinanceDashboard from '@/pages/finance/FinanceDashboard'
import ManageCategories from '@/pages/admin/ManageCategories'
import ManageAds from '@/pages/admin/ManageAds'
import { useAuthStore } from '@/stores/useAuthStore'
import { EvaluationModal } from '@/components/EvaluationModal'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      {user?.pendingEvaluation && <EvaluationModal open={true} />}
      {children}
    </>
  )
}

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuthStore()
  // Allow admin based on role or specific email for testing
  const isAdmin = user?.role === 'admin' || user?.email.includes('admin')

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const App = () => {
  useEffect(() => {
    document.title = 'BIDWORK - Marketplace de Serviços'
  }, [])

  return (
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Admin Routes */}
              <Route
                path="/admin/categories"
                element={
                  <AdminRoute>
                    <ManageCategories />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/ads"
                element={
                  <AdminRoute>
                    <ManageAds />
                  </AdminRoute>
                }
              />

              <Route path="/plans" element={<PlansList />} />
              <Route path="/plans/:id" element={<PlanDetail />} />

              {/* Marketplace Routes */}
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/find-jobs" element={<FindJobs />} />
              <Route path="/my-jobs" element={<MyJobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/disputes/new/:id" element={<Dispute />} />

              {/* Payment Routes */}
              <Route
                path="/payment/checkout/:jobId/:bidId"
                element={<PaymentCheckout />}
              />
              <Route path="/payment/success" element={<PaymentSuccess />} />

              {/* Finance Routes */}
              <Route path="/subscription" element={<SubscriptionPlans />} />
              <Route path="/credits" element={<CreditsStore />} />
              <Route path="/loyalty" element={<LoyaltyProgram />} />
              <Route path="/finance" element={<FinanceDashboard />} />

              {/* Common Routes */}
              <Route path="/documents" element={<Documents />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/testing" element={<TestingHub />} />

              <Route
                path="/messages"
                element={<Navigate to="/dashboard" replace />}
              />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
