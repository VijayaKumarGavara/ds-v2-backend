const express = require("express");
const procurementRequestController = require("../controllers/procurementRequestController");
const router = express.Router();

router.post("/add", procurementRequestController.createProcurmentRequest);
router.patch("/update", procurementRequestController.updateProcurementRequest);
router.delete("/delete", procurementRequestController.deleteProcurementRequest);
router.get("/get", procurementRequestController.getProcurementRequests);
module.exports = router;
