import RoleRoute from './RoleRoute';

function AdminRoute({ children }) {
  return <RoleRoute allowedRoles={['admin']}>{children}</RoleRoute>;
}

export default AdminRoute;
