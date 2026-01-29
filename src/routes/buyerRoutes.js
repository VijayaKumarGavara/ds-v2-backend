const express = require("express");
const buyerController = require("../controllers/buyerController");

const router = express.Router();

router.post("/register", buyerController.registerBuyer);
router.post("/login", buyerController.loginBuyer);
router.patch("/update", buyerController.updateBuyer);
router.post("/find-farmers", buyerController.findFarmers);
router.get("/recent-farmers", buyerController.getRecentFarmers);
router.get("/procurement-requests", buyerController.getProcurementRequests);
router.get("/procurements", buyerController.getProcurements);
router.get("/payment-dues", buyerController.getPaymentDues);
router.get("/transactions", buyerController.getTransactions);
module.exports = router;
