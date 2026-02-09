const express = require("express");
const buyerController = require("../controllers/buyerController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");
const upload=require("../middlewares/uploadBuyer");

const router = express.Router();

router.post("/register",upload.single("buyer_photo"), buyerController.registerBuyer);
router.post("/login", buyerController.loginBuyer);
router.get("/profile", authenticate, authorizeRole("buyer"),buyerController.getProfile);
router.patch("/update", authenticate, authorizeRole("buyer"),buyerController.updateBuyer);
router.post("/find-farmers",authenticate, authorizeRole("buyer"), buyerController.findFarmers);
router.get("/recent-farmers",authenticate, authorizeRole("buyer"), buyerController.getRecentFarmers);
router.get("/procurement-requests",authenticate, authorizeRole("buyer"), buyerController.getProcurementRequests);
router.get("/procurements",authenticate, authorizeRole("buyer"), buyerController.getProcurements);
router.get("/payment-dues",authenticate, authorizeRole("buyer"), buyerController.getPaymentDues);
router.get("/transactions",authenticate, authorizeRole("buyer"), buyerController.getTransactions);
module.exports = router;
