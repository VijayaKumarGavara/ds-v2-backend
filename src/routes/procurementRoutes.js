const express = require("express");
const procurementController = require("../controllers/procurementController");
const router = express.Router();

router.post("/add", procurementController.createProcurement);
module.exports = router;
