const express = require("express");

const paymentController = require("../controllers/paymentController");

const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/authorizeRole");

const router = express.Router();

router.post("/record-payment",authenticate, authorizeRole("buyer"), paymentController.recordPayment);

module.exports = router;
