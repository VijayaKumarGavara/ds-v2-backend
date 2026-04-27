const express = require("express");

const driverController = require("../controllers/driverController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/register",
  upload.single("driver_photo"),
  driverController.registerDriver,
);
router.post("/login", driverController.loginDriver);
router.patch(
  "/update",
  authenticate,
  authorizeRole("driver"),
  upload.single("driver_photo"),
  driverController.updateProfile,
);
router.get(
  "/profile",
  authenticate,
  authorizeRole("driver"),
  driverController.getProfile,
);

router.post(
  "/find-farmers",
  authenticate,
  authorizeRole("driver"),
  driverController.findFarmers,
);
router.get(
  "/recent-farmers",
  authenticate,
  authorizeRole("driver"),
  driverController.getRecentFarmers,
);
router.get(
  "/work-records",
  authenticate,
  authorizeRole("driver"),
  driverController.getTractorWorks,
);
router.get(
  "/payment-dues",
  authenticate,
  authorizeRole("driver"),
  driverController.getPaymentDues,
);

router.get(
  "/transactions",
  authenticate,
  authorizeRole("driver"),
  driverController.getTransactions,
);

module.exports = router;
