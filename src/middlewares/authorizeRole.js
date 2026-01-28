const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).send({
        success: false,
        message: "Access denied",
      });
    }
    next();
  };
};

module.exports = authorizeRole;
