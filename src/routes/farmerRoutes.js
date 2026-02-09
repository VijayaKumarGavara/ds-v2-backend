const express = require("express");
const farmerController = require("../controllers/farmerController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");
const upload=require("../middlewares/upload");
const router = express.Router();

router.post("/register",upload.single("farmer_photo"), farmerController.registerFarmer);
router.post("/login", farmerController.loginFarmer);
router.get("/profile",  authenticate, authorizeRole("farmer"),farmerController.getProfile);
router.patch("/update",  authenticate, authorizeRole("farmer"),farmerController.updateProfile);
router.get("/sales",  authenticate, authorizeRole("farmer"),farmerController.getSellingRecords);
router.get("/sales/finalized", authenticate, authorizeRole("farmer"), farmerController.getFinalizedRecords);
router.get("/payment-dues", authenticate, authorizeRole("farmer"), farmerController.getPaymentDues);
router.get("/transactions", authenticate, authorizeRole("farmer"), farmerController.getTransactions);

module.exports = router;
