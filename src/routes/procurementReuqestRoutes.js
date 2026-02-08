const express = require("express");
const procurementRequestController = require("../controllers/procurementRequestController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

const router = express.Router();

router.post("/add", authenticate, authorizeRole("buyer"),procurementRequestController.createProcurmentRequest);
router.patch("/update",authenticate, authorizeRole("buyer"), procurementRequestController.updateProcurementRequest);
router.delete("/delete",authenticate, authorizeRole("buyer"), procurementRequestController.deleteProcurementRequest);
router.get("/get", procurementRequestController.getProcurementRequests);
module.exports = router;
