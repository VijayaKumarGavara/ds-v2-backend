const express = require("express");
const farmerController = require("../controllers/farmerController");

const router = express.Router();

router.post("/register", farmerController.registerFarmer);
router.post("/login", farmerController.loginFarmer);
router.get("/profile", farmerController.getProfile);
router.patch("/update", farmerController.updateProfile);
router.get("/sales", farmerController.getSellingRecords);
router.get("/sales/finalized", farmerController.getFinalizedRecords);
router.get("/payment-dues", farmerController.getPaymentDues);
router.get("/transactions", farmerController.getTransactions);

module.exports = router;
