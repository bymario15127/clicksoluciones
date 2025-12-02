import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, hasRole } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
