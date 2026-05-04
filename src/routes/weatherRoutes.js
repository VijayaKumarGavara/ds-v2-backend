const express = require("express");

const weatherController = require("../controllers/weatherController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

const router = express.Router();

router.get(
  "/forecast",
  authenticate,
  authorizeRole("farmer"),
  weatherController.getWeatherForecast
);

module.exports = router;
