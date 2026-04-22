import RoleRoute from './RoleRoute';

function ProtectedRoute({ children }) {
  return <RoleRoute allowedRoles={['user', 'admin']}>{children}</RoleRoute>;
}

export default ProtectedRoute;
