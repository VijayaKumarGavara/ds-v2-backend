const express = require("express");
const farmerController = require("../controllers/farmerController");

const router = express.Router();

router.post("/register", farmerController.registerFarmer);
router.get("/all-farmers", farmerController.getFarmers);
router.patch("/update", farmerController.updateFarmer);
module.exports = router;
