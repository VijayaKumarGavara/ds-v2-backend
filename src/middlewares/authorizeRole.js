const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).send({
        success: false,
        message: "Access denied",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized for this action",
      });
    }
    next();
  };
};

module.exports = authorizeRole;
