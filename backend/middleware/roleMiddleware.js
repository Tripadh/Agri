const normalizeRoleList = (roles) => Array.from(new Set(roles.filter(Boolean)));

export const allowRoles = (...roles) => {
  const allowedRoles = normalizeRoleList(roles);

  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }

    return next();
  };
};

export const allowUser = allowRoles('user');
export const allowAdmin = allowRoles('admin');
