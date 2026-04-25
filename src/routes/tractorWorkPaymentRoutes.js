const express = require("express");

const tractorWorkPaymentController=require("../controllers/tractorWorkPaymentController")

const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

const router = express.Router();

router.post("/record-payment",authenticate, authorizeRole("driver"), tractorWorkPaymentController.recordPayment);

module.exports = router;
