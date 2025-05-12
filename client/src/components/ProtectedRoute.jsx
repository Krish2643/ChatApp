import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/UserStore'
import { ROUTES } from '../config/constants'

const ProtectedRoute = ({ children }) => {
  const { user } = useUserStore()
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  
  return children
}

export default ProtectedRoute