const jwt = require("jsonwebtoken");

const JWT_SECRET = "dhanya_sethu_secret_key";

const generateToken = (paypload) => {
  return jwt.sign(paypload, JWT_SECRET, { expiresIn: "7d" });
};

const verify = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verify };
