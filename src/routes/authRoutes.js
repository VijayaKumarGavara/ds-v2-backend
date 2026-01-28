const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authMiddleware");
const { getMe } = require("../controllers/authController");

router.get("/me", authenticate, getMe);

module.exports = router;
