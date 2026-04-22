import { Navigate } from 'react-router-dom';
import { getCurrentRole } from '../services/authService';

function RoleRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getCurrentRole();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

export default RoleRoute;
