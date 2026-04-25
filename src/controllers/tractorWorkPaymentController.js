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
      discount: discountStr = 0,
      remarks,
      payment_mode = "cash",
    } = req.body;

    const amount = parseFloat(amountStr) || 0;
    const discount = parseFloat(discountStr) || 0;

    if (amount < 0 || discount < 0) {
      throw new Error("Amount and discount must be non-negative");
    }

    if (amount === 0 && discount === 0) {
      throw new Error("Enter payment or discount");
    }

    await session.startTransaction();
    transactionStarted = true;

    // Get due
    const due = await TractorWorkPaymentDue.findDue(
      farmer_id,
      driver_id,
      due_id,
      session
    );

    if (!due) {
      throw new Error("No due found");
    }

    const totalAdjustment = amount + discount;

    if (totalAdjustment > due.balance_amount) {
      throw new Error("Payment + discount exceeds balance");
    }

    const balance_before = due.balance_amount;

    // Apply payment + discount
    const updatedDue = await TractorWorkPaymentDue.applyPayment(
      { due_id, farmer_id, driver_id },
      totalAdjustment,
      session
    );

    // Save transaction
    const transactionInfo = {
      transaction_id: `T${Date.now()}`,
      farmer_id,
      driver_id,
      amount,
      discount,
      payment_mode,
      remarks,
      balance_before,
      balance_after: updatedDue.balance_amount,
    };

    const transactionResponse =
      await TractorTransaction.createTransaction(
        transactionInfo,
        session
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