import { Navigate } from 'react-router-dom'

// Since ConstructionDashboard already lists projects, this acts as a redirect or separate list view
// For simplicity in this iteration, redirecting to dashboard which acts as the main hub
export default function ProjectList() {
  return <Navigate to="/construction/dashboard" replace />
}
