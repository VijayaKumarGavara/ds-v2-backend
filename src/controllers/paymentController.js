const mongoose = require("mongoose");
const PaymentDue = require("../models/payment_dues");
const Transaction = require("../models/transaction");

exports.recordPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { farmer_id, buyer_id, amount, remarks } = req.body;

    if (amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    await session.startTransaction();
    // 1. find existing due
    const due = await PaymentDue.findDue(farmer_id, buyer_id, session);

    if (!due) {
      throw new Error("No payment due exists for this farmer and buyer");
    }

    if (amount > due.balance_amount) {
      throw new Error("Payment amount exceeds outstanding balance");
    }

    const balance_before = due.balance_amount;

    // 2. update due
    const updatedDue = await PaymentDue.applyPayment(
      { farmer_id, buyer_id },
      amount,
      session
    );

    // 3. create transaction
    const transactionInfo = {
      transaction_id: `T${Date.now()}`,
      farmer_id,
      buyer_id,
      amount,
      remarks,
      balance_before,
      balance_after: updatedDue.balance_amount,
    };
    const transactionResponse = await Transaction.createTransaction(
      transactionInfo,
      session
    );

    session.commitTransaction();
    session.endSession();
    res.status(200).send({
      success: true,
      data: { updatedDue, transactionResponse },
      message: "Payment recorded successfully",
    });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to record the payment",
    });
  }
};
