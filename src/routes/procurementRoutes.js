const express = require("express");
const procurementController = require("../controllers/procurementController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

const router = express.Router();

router.post("/add", authenticate, authorizeRole("buyer"),procurementController.createProcurement);
router.post("/add-finalized-procurement",authenticate, authorizeRole("buyer"), procurementController.createFinalizedProcurement);
module.exports = router;
