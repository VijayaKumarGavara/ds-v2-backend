const mongoose = require("mongoose");
const Procurement = require("../models/procurement");
const ProcurementRequest = require("../models/procurement_request");
const PaymentDue = require("../models/payment_dues");

exports.createProcurement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const procurementInfo = { ...req.body };
    const { farmer_id, buyer_id } = procurementInfo;

    const request = await ProcurementRequest.updateProcurementRequest(
      { request_id: procurementInfo.request_id, status: "pending" },
      { status: "finalized" },
      { new: true, session: session }
    );

    if (!request) {
      throw new Error("Invalid or already finalized request");
    }
    const total_amount = request.quantity * Number(procurementInfo.cost_per_unit);
    procurementInfo.total_amount = total_amount;

    const procurement = await Procurement.createProcurement(procurementInfo, {
      session: session,
    });
    // const alreadyExistedPaymentDue = await PaymentDue.findDue(
    //   farmer_id,
    //   buyer_id
    // );
    // if (alreadyExistedPaymentDue) {
    //   const total_procurement_amount =
    //     alreadyExistedPaymentDue.total_procurement_amount + total_amount;
    //   const balance_amount =
    //     alreadyExistedPaymentDue.balance_amount + total_amount;
    //   const updatedInfo = await PaymentDue.updatePaymentDue(
    //     farmer_id,
    //     buyer_id,
    //     { total_procurement_amount, balance_amount }
    //   );
    // } else {
    //   const createPaymentDue = await PaymentDue.createPaymentDue({
    //     due_id: `D${Date.now()}`,
    //     farmer_id,
    //     buyer_id,
    //     total_procurement_amount: total_amount,
    //     total_paid_amount: 0,
    //     balance_amount: total_amount,
    //   });
    // }
    const due = await PaymentDue.updatePaymentDue(
      { farmer_id: request.farmer_id, buyer_id: request.buyer_id },
      total_amount,
      session
    );

    await session.commitTransaction();
    session.endSession();
    res.status(200).send({
      success: true,
      data: due,
      message: "Successfully created the procurement.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).send({
      success: false,
      error: error.message,
      message: "Failed to create the procurement.",
    });
  }
};
