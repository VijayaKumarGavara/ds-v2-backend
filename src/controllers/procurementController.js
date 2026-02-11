const mongoose = require("mongoose");
const Procurement = require("../models/procurement");
const ProcurementRequest = require("../models/procurement_request");
const PaymentDue = require("../models/payment_dues");
const { generateId } = require("../utils/generateId");
const getAgriYear = require("../utils/getAgriYear");

exports.createProcurement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const requestInfo = { ...req.body };

    const request = await ProcurementRequest.updateProcurementRequest(
      { request_id: requestInfo.request_id, status: "pending" },
      { status: "finalized" },
      { new: true, session },
    );
    const { farmer_id, buyer_id, crop_id, quantity, request_id, agri_year } = request;
    if (!request) {
      throw new Error("Invalid or already finalized request");
    }
    const total_amount = quantity * Number(requestInfo.cost_per_unit);
    const procuremetInput = {
      procurement_id: generateId("P"),
      request_id,
      farmer_id,
      buyer_id,
      crop_id,
      quantity,
      cost_per_unit: requestInfo.cost_per_unit,
      total_amount,
      agri_year,
    };
    const procurement = await Procurement.createProcurement(procuremetInput, {
      session: session,
    });

    let due_id;
    const existingDue = await PaymentDue.existingDue(
      farmer_id,
      buyer_id,
      session,
    );
    if (existingDue) {
      due_id = existingDue.due_id; // reuse
    } else {
      due_id = generateId("DUE"); // create new
    }
    const due = await PaymentDue.updatePaymentDue(
      { farmer_id, buyer_id },
      total_amount,
      due_id,
      session,
    );

    await session.commitTransaction();
    session.endSession();
    res.status(200).send({
      success: true,
      data: [procurement, due],
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

exports.createFinalizedProcurement = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      farmer_id,
      buyer_id,
      crop_id,
      crop_units,
      quantity,
      cost_per_unit,
    } = req.body;

    if (!farmer_id || !buyer_id || !crop_id || !quantity || !cost_per_unit) {
      throw new Error("Missing required fields");
    }
    const agri_year = getAgriYear();
    const requestPayload = {
      request_id: generateId("PR"),
      farmer_id,
      buyer_id,
      crop_id,
      crop_units,
      quantity,
      status: "finalized",
      agri_year,
    };

    const request =
      await ProcurementRequest.createProcurementRequest(
        requestPayload,
        session
      );

    const total_amount = Number(quantity) * Number(cost_per_unit);

    const procurementPayload = {
      procurement_id: generateId("P"),
      request_id: request.request_id,
      farmer_id,
      buyer_id,
      crop_id,
      quantity,
      cost_per_unit,
      total_amount,
      agri_year,
    };

    const procurement =
      await Procurement.createProcurement(procurementPayload, { session });

    let due_id;

    const existingDue =
      await PaymentDue.existingDue(farmer_id, buyer_id, session);

    if (existingDue) {
      due_id = existingDue.due_id;
    } else {
      due_id = generateId("DUE");
    }

    const due =
      await PaymentDue.updatePaymentDue(
        { farmer_id, buyer_id },
        total_amount,
        due_id,
        session
      );

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      success: true,
      message: "Spot procurement finalized successfully",
      data: {
        procurement,
        due,
      },
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).send({
      success: false,
      message: "Failed to finalize procurement",
      error: error.message,
    });
  }
};

