const jwt = require('jsonwebtoken');

const ROLE = {
  SUPERADMIN: 'superadmin',
  COMPANYADMIN: 'companyadmin',
  BORDEROFFICER: 'borderofficer',
  HEALTHOFFICER: 'healthofficer',
};

const validateRole = (role) => Object.values(ROLE).includes(role);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};