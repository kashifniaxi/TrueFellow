/**
 * Express middleware to restrict access based on user role.
 * Requires `authenticate` to run first so `req.user` is populated.
 * @param  {...string} allowedRoles - Roles permitted (e.g. 'ADMIN', 'ORGANIZER')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }

    next();
  };
};

export default authorizeRoles;
