const { verifyToken } = require("../utils/jwt");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({
        success: false,
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    const decoded = verifyToken(token);
    // decoded = { user_id, role, iat, exp }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticate;
