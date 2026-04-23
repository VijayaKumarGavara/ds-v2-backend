const mongoose = require("mongoose");
const TractorWorkPaymentDue = require("../models/tractor_work_payment_due");
const TractorTransaction = require("../models/tractor_transaction");

exports.recordPayment = async (req, res) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    const {
      due_id,
      farmer_id,
      driver_id,
      amount: amountStr,
      remarks,
    } = req.body;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Payment amount must be a positive number");
    }

    await session.startTransaction();
    transactionStarted = true;
    // 1. find existing due
    const due = await TractorWorkPaymentDue.findDue(
      farmer_id,
      driver_id,
      due_id,
      session,
    );

    if (!due) {
      throw new Error("No payment due exists for this farmer and buyer");
    }

    if (amount > due.balance_amount) {
      throw new Error("Payment amount exceeds outstanding balance");
    }

    const balance_before = due.balance_amount;

    // 2. update due
    const updatedDue = await TractorWorkPaymentDue.applyPayment(
      { due_id, farmer_id, driver_id },
      amount,
      session,
    );

    // 3. create transaction
    const transactionInfo = {
      transaction_id: `T${Date.now()}`,
      farmer_id,
      driver_id,
      amount,
      remarks,
      balance_before,
      balance_after: updatedDue.balance_amount,
    };
    const transactionResponse = await TractorTransaction.createTransaction(
      transactionInfo,
      session,
    );

    await session.commitTransaction();
    session.endSession();
    res.status(200).send({
      success: true,
      data: { updatedDue, transactionResponse },
      message: "Payment recorded successfully",
    });
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    session.endSession();
    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to record the payment",
    });
  }
};
